define("ace/snippets/mcbasic",["require","exports","module"], function(require, exports, module) {
	"use strict";
	
exports.snippetText = "\
snippet Attach\n\
	Attach ${1?:element}\n\
		\n\
	Detach ${2?:element}\n\
snippet Call\n\
	call ${1:sub_name}\n\
snippet Delay\n\
	delay ${1?:element} ${2:10}\n\
snippet Dim\n\
	dim ${1?:shared} ${2:varName} as ${3:varType}\n\
snippet For\n\
	for ${1:var_name} = ${2:startIndex} to ${3:endIndex}\n\
		${4:' Do something...}\n\
	next\n\
snippet Function\n\
	${1?:public} function ${2:func_name}${3?:(params)} as ${4:type}\n\
		${5:' Your code here...}\n\
	end function\n\
snippet goHome\n\
	goHome(${1:-1})\n\
snippet If\n\
	if ${1:condition} then\n\
		${2:' Do something...}\n\
	end if\n\
snippet If...else...\n\
	if ${1:condition} then\n\
		${2:' Do something...}\n\
	else\n\
		${3:' Do something else...}\n\
	end if\n\
snippet grp_close\n\
	GRP_CLOSE_GRIPPER(\"${1:end_effector}\",\"${2:gripper}\")\n\
snippet grp_open\n\
	GRP_OPEN_GRIPPER(\"${1:end_effector}\",\"${2:gripper}\")\n\
snippet grp_set\n\
	GRP_SET_ACTIVE_GRIPPER(\"${1:end_effector}\",\"${2:gripper}\")\n\
snippet pay_set\n\
	PAY_SET_PAYLOAD(\"${1:payload}\")\n\
snippet plt_entry\n\
	PLT_MOVE_TO_ENTRY_POSITION(${1:robot},\"${2:pallet_name}\")\n\
snippet plt_pick\n\
	PLT_PICK_FROM_PALLET(${1:robot},\"${2:pallet_name}\")\n\
snippet plt_place\n\
	PLT_PLACE_ON_PALLET(${1:robot},\"${2:pallet_name}\")\n\
snippet plt_set_index\n\
	PLT_SET_INDEX_STATUS(\"${1:pallet_name}\",${2:index})\n\
snippet Program\n\
	program\n\
		\n\
		${1:' Your code here...}\n\
		\n\
	end program\n\
snippet Select\n\
	select case ${1:var_name}\n\
		case ${2:val1}\n\
			${3:' Do something...'}\n\
		case ${4:val2}\n\
			${5:' Do something else...'}\n\
	end select\n\
snippet Sleep\n\
	sleep ${1:10}\n\
snippet While\n\
	while ${1?:condition}\n\
		${2:' Do something...}\n\
	end while\n\
";
	exports.scope = "mcbasic";
	
	});                (function() {
											window.require(["ace/snippets/mcbasic"], function(m) {
													if (typeof module == "object" && typeof exports == "object" && module) {
															module.exports = m;
													}
											});
									})();
							