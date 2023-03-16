#![cfg_attr(target_arch = "wasm32", no_std)]
#![cfg_attr(target_arch = "wasm32", feature(alloc_error_handler))]

/// storage keys used by this contract because it uses raw storage key value writes and reads
const RULES_KEY: &[u8] = b"r";
/// register constants used
const REGISTER_0: u64 = 0;
/// string literals (improve readability)
const DOUBLE_QUOTE_BYTE: u8 = b'\"';
const RECEIVER_HEADER: &str = "\"|kR|\":";
const ACTION_HEADER: &str = "\"|kA|\":";
const PARAM_STOP: &str = "|kS|\"";
const COMMA: &str = ",";
const ANY_METHOD: &str = "*";
const CALLBACK_GAS: u64 = 20_000_000_000_000;

/// repeated string literals (in parsing tx payloads)
const DEPOSIT: &str = "|kP|deposit";
const CALLBACK_METHOD_NAME: &str = "callback";

extern crate alloc;

/// DEBUGGING REMOVE
// use alloc::format;

use alloc::vec;
use alloc::vec::Vec;
use alloc::format;
use alloc::string::String;
use alloc::string::ToString;

mod sys;
use sys::*;
mod parse;
use parse::*;

#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[cfg(target_arch = "wasm32")]
#[panic_handler]
#[no_mangle]
pub unsafe fn on_panic(_info: &::core::panic::PanicInfo) -> ! {
    core::arch::wasm32::unreachable()
}

#[cfg(target_arch = "wasm32")]
#[alloc_error_handler]
#[no_mangle]
pub unsafe fn on_alloc_error(_: core::alloc::Layout) -> ! {
    core::arch::wasm32::unreachable()
}

#[no_mangle]
pub fn setup() {
    unsafe { near_sys::input(REGISTER_0) };
    let data = register_read(REGISTER_0);
	// remove quotes from string with slice, strip slashes, and write it
	let data_str = alloc::str::from_utf8(&data[1..data.len()-1]).ok().unwrap_or_else(|| sys::panic());
    swrite(RULES_KEY, data_str.replace("\\\"", "\"").as_bytes());
}

#[no_mangle]
pub fn execute() {
	// rules
	let rules_data = storage_read(RULES_KEY);
	let rules_str = alloc::str::from_utf8(&rules_data).ok().unwrap_or_else(|| sys::panic());

	let contracts: Vec<&str> = get_string(rules_str, "|kP|contracts").split(",").collect();
	let methods: Vec<Vec<&str>> = get_string(rules_str, "|kP|methods").split(",").map(|s| s.split(":").collect()).collect();
	let amounts: Vec<u128> = get_string(rules_str, "|kP|amounts")
		.split(",")
		.map(|a| {
			let amount: u128 = a.parse().ok().unwrap_or_else(|| sys::panic());
			amount
		})
		.collect();
	let repay: &str = get_string(rules_str, "|kP|repay");
	let funder: &str = get_string(rules_str, "|kP|funder");
	let floor: &str = get_string(rules_str, "|kP|floor");

	// args
    unsafe { near_sys::input(REGISTER_0) };
    let data = register_read(REGISTER_0);
	let msg = alloc::str::from_utf8(&data).ok().unwrap_or_else(|| sys::panic()).replace("\\\"", "\"");
	log(&msg);

	// transactions
	let mut transactions: Vec<&str> = msg.split(RECEIVER_HEADER).collect();
	transactions.remove(0);

	// promise ids for each tx
	let mut promises: Vec<u64> = vec![];

	// execute transactions
	while transactions.len() > 0 {
		let tx = transactions.remove(0);

		let (mut receiver_id, tx_rest) = tx.split_once(COMMA).unwrap_or_else(|| sys::panic());
		receiver_id = &receiver_id[1..receiver_id.len()-1];

		log(receiver_id);

		let receiver_index_option = contracts.iter().position(|c| c == &receiver_id);
		if receiver_index_option.is_none() {
			sys::panic()
		}
		let receiver_index = receiver_index_option.unwrap();

		let id = if promises.len() == 0 {
			unsafe {
				near_sys::promise_batch_create(
					receiver_id.len() as u64,
					receiver_id.as_ptr() as u64
				)
			}
		} else {
			unsafe {
				near_sys::promise_batch_then(
					promises[promises.len() - 1],
					receiver_id.len() as u64,
					receiver_id.as_ptr() as u64
				)
			}
		};
		promises.push(id);

		// actions for tx
		let mut actions: Vec<&str> = tx_rest.split(ACTION_HEADER).collect();
		actions.remove(0);
		
		while actions.len() > 0 {
			let action = actions.remove(0);

			let (mut action_type, params) = action.split_once(COMMA).unwrap_or_else(|| sys::panic());
			action_type = &action_type[1..action_type.len()-1];

			log(action_type);
			log(params);

			// match

			match action_type.as_bytes() {
				b"FunctionCall" => {
					let method_name = get_string(params, "|kP|methodName");

					if methods[receiver_index][0] != ANY_METHOD && !methods[receiver_index].contains(&method_name) {
						sys::panic()
					}
					let args = &get_string(params, "|kP|args").replace("\\", "");
					let deposit = get_u128(params, DEPOSIT);
					// if deposit > amounts[receiver_index] {
					// 	sys::panic()
					// }
					let gas = get_u128(params, "|kP|gas") as u64;
					unsafe {
						near_sys::promise_batch_action_function_call(
							id,
							method_name.len() as u64,
							method_name.as_ptr() as u64,
							args.len() as u64,
							args.as_ptr() as u64,
							deposit.to_le_bytes().as_ptr() as u64,
							gas,
						);



						// near_sys::current_account_id(REGISTER_0);
						// let current_account_id_bytes = register_read(REGISTER_0);
						// let current_account_id = alloc::str::from_utf8(&current_account_id_bytes).ok().unwrap_or_else(|| sys::panic());
						
						// let cb_id = near_sys::promise_batch_then(
						// 	id,
						// 	current_account_id.len() as u64,
						// 	current_account_id.as_ptr() as u64,
						// );
						// promises.push(cb_id);
						// let args = "";
						// let deposit: u64 = 0;
						// near_sys::promise_batch_action_function_call(
						// 	cb_id,
						// 	CALLBACK_METHOD_NAME.len() as u64,
						// 	CALLBACK_METHOD_NAME.as_ptr() as u64,
						// 	args.len() as u64,
						// 	args.as_ptr() as u64,
						// 	deposit.to_le_bytes().as_ptr() as u64,
						// 	CALLBACK_GAS,
						// );



						near_sys::current_account_id(REGISTER_0);
						let current_account_id_bytes = register_read(REGISTER_0);
						let current_account_id = alloc::str::from_utf8(&current_account_id_bytes).ok().unwrap_or_else(|| sys::panic());
						
						// then make another promise back receiver == current_account_id
						let cb_id = near_sys::promise_batch_then(
							id,
							current_account_id.len() as u64,
							current_account_id.as_ptr() as u64,
						);
						promises.push(cb_id);


						let args = deposit.to_string();
						// let args_str = alloc::str::from_utf8(&args).ok().unwrap_or_else(|| sys::panic());

						let callback_deposit: u64 = 0;
						near_sys::promise_batch_action_function_call(
							cb_id,
							CALLBACK_METHOD_NAME.len() as u64,
							CALLBACK_METHOD_NAME.as_ptr() as u64,
							args.len() as u64,
							args.as_ptr() as u64,
							callback_deposit.to_le_bytes().as_ptr() as u64,
							CALLBACK_GAS,
						);
					};
				}
				_ => {}
			}
		}
	}
}

#[no_mangle]
pub unsafe fn callback() {
	log(CALLBACK_METHOD_NAME);

	near_sys::promise_result(0, REGISTER_0);
	let result_bytes = register_read(REGISTER_0);
	let result = alloc::str::from_utf8(&result_bytes).ok().unwrap_or_else(|| sys::panic());
	log(result);

	// parse the attachedDeposit from the call
	near_sys::input(REGISTER_0);
	let amount_bytes = register_read(REGISTER_0);
	let amount_str = alloc::str::from_utf8(&amount_bytes).ok().unwrap_or_else(|| sys::panic());
	let amount: u128 = amount_str.parse().ok().unwrap_or_else(|| sys::panic());

	// rules
	let rules_data = storage_read(RULES_KEY);
	let rules_str = alloc::str::from_utf8(&rules_data).ok().unwrap_or_else(|| sys::panic());

	let mut floor: u128 = get_u128(rules_str, "|kP|floor");
	floor = floor - amount;

	// let new_rules = update_string_2();
	let new_rules = update_string(rules_str, "|kP|floor", &format!("{}", floor));
    swrite(RULES_KEY, new_rules.as_bytes());

	log(&new_rules);
}

#[no_mangle]
pub fn exit() {
	// rules
	let rules_data = storage_read(RULES_KEY);
	let rules_str = alloc::str::from_utf8(&rules_data).ok().unwrap_or_else(|| sys::panic());
	let repay: u128 = get_string(rules_str, "|kP|repay").parse().ok().unwrap_or_else(|| sys::panic());
	
	log(&format!("{}", repay));

	let account_balance = account_balance();
	log(&format!("{}", account_balance));
	if account_balance < repay {
		log("cannot repay");
	}
}

/// views

#[no_mangle]
pub(crate) unsafe fn get_rules() {
    return_bytes(&storage_read(RULES_KEY), true);
}