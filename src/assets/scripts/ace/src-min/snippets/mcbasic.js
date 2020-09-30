define("ace/snippets/mcbasic",["require","exports","module"], function(require, exports, module) {
	"use strict";

	exports.snippetText = "\
snippet ABS\n\
	ABS(${1:value})\n\
snippet Accept\n\
	Accept(${1?:#listening_device_number,}#${2:accepting_device_number},${3:port})\n\
snippet ACOS\n\
	ACOS(${1:value})\n\
snippet ArraySize\n\
	ArraySize(${1:arr_name},${2:dimension})\n\
snippet ASC\n\
	ASC(${1:\"\"})\n\
snippet ASIN\n\
	ASIN(${1:value})\n\
snippet ATAN2\n\
	ATAN2(${1:y_val},${2:x_val})\n\
snippet ATN\n\
	ATN(${1:value})\n\
snippet AttachTo\n\
	AttachTo ${1?:element} File=${2:task}\n\
snippet AttachTo$\n\
	AttachTo$ ${1?:element} File=\"${2:task}\"\n\
snippet BIN$\n\
	BIN$(${1:value})\n\
snippet Call\n\
	call ${1:sub_name}\n\
snippet CHR$\n\
	CHR$(${1:1})\n\
snippet close\n\
	close #${1:device_handle}\n\
snippet Connect\n\
	Connect(#${1:device_number},\"${2:127.0.0.1}\",${3:port},${4?:timeout})\n\
snippet COS\n\
	COS(${1:value})\n\
snippet Delay\n\
	delay ${1?:element} ${2:10}\n\
snippet delete\n\
	delete ${1:filename}\n\
snippet delete$\n\
	delete$ \"${1:filename}\"\n\
snippet deletePLS\n\
	deletePLS ${1:pls_name}\n\
snippet detachFrom\n\
	detachFrom ${1?:element} File=${2:task}\n\
snippet detachFrom$\n\
	detachFrom$ ${1?:element} File=\"${2:task}\"\n\
snippet Dim\n\
	dim ${1?:shared} ${2:varName} as ${3:variable_type}\n\
snippet dir\n\
	dir ${1?:file}\n\
snippet dir$\n\
	dir$(\"${1?:file}\")\n\
snippet DISTL\n\
	DISTL(${1:loc1},${2:loc2})\n\
snippet DISTR\n\
	DISTR(${1:loc1},${2:loc2})\n\
snippet error\n\
	${1?:taskname.}error\n\
snippet EXP\n\
	EXP(${1:value})\n\
snippet fileSize\n\
	fileSize ${1:file_name}\n\
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
snippet goTo\n\
	goTo ${1:label}\n\
snippet grp_close\n\
	GRP_CLOSE_GRIPPER(\"${1:end_effector}\",\"${2:gripper}\")\n\
snippet grp_open\n\
	GRP_OPEN_GRIPPER(\"${1:end_effector}\",\"${2:gripper}\")\n\
snippet grp_set\n\
	GRP_SET_ACTIVE_GRIPPER(\"${1:end_effector}\",\"${2:gripper}\")\n\
snippet HEX$\n\
	HEX$(${1:1})\n\
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
snippet import\n\
	import ${1:lib_name}\n\
snippet INSTR\n\
	INSTR(${1:\"expression\"},${2?:\"search_string\"},${3?:\"sub_string\"})\n\
snippet isOpen\n\
	isOpen(${1:device_handle})\n\
snippet LCASE$\n\
	LCASE$(${1:\"string\"})\n\
snippet LEFT$\n\
	LEFT$(${1:\"string\"},${2:number_of_chars})\n\
snippet LEN\n\
	LEN(${1:\"string\"})\n\
snippet LOC\n\
	LOC(${1:device_handle})\n\
snippet LOG\n\
	LOG(${1:value})\n\
snippet logger\n\
	logger ${1:error_name}\n\
snippet LTRIM$\n\
	LTRIM$(${1:\"string\"})\n\
snippet MID$\n\
	MID$(${1:\"string\"},${2:start_index},${3:num_of_chars})\n\
snippet open\n\
	Open ${1:comport} BaudRate=${2:value} Parity=${3:value} DataBits=${4:value} StopBit=${5:value} ${6?:XOnOff=value} as #${7:device_handle}\n\
snippet openSocket\n\
	openSocket options=${1:num} as #${2:device_number}\n\
snippet pauseTask\n\
	pauseTask ${1:task_name}\n\
snippet pauseTask$\n\
	pauseTask \"${1:task_name}\"\n\
snippet plsList\n\
	plsList ${1?:pls_name}\n\
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
snippet print\n\
	print ${1:\"string\"}\n\
snippet printU\n\
	printU ${1:\"#.################\"} ; ${2:expression}\n\
snippet printUToBuff\n\
	PrintUToBuff #${1:1} , \"${2:value is ##.##}\" ; ${3:expression}\n\
snippet Program\n\
	program\n\
		\n\
		${1:' Your code here...}\n\
		\n\
	end program\n\
snippet record\n\
	record ${1:MYREC}.REC ${2:samples} Gap=${3:1} RecData=${4:param1, param2, param3} \n\
snippet record$\n\
	record \"${1:MYREC}.REC\" ${2:samples} Gap=${3:1} RecData=${4:param1, param2, param3} \n\
snippet RIGHT$\n\
	RIGHT$(${1:\"string\"},${2:number_of_chars})\n\
snippet ROUND\n\
	ROUND(${1:value})\n\
snippet RTRIM$\n\
	RTRIM$(${1:\"string\"})\n\
snippet seek\n\
	seek(#${1:device_handle},${2:IPointer})\n\
snippet Select\n\
	select case ${1:var_name}\n\
		case ${2:val1}\n\
			${3:' Do something...'}\n\
		case ${4:val2}\n\
			${5:' Do something else...'}\n\
	end select\n\
snippet SelectTool\n\
	SelectTool(\"${1:string}\")\n\
snippet SelectBase\n\
	SelectBase(\"${1:string}\")\n\
snippet SGN\n\
	SGN(${1:value})\n\
snippet SIZE\n\
	SIZE(${1:\"string\"})\n\
snippet Sleep\n\
	sleep ${1:10}\n\
snippet SPACE$\n\
	SPACE$(${1:num_of_spaces})\n\
snippet STR$\n\
	STR$(${1:number})\n\
snippet STRD$\n\
	STRD$(${1:number},${2:\"format_string\"})\n\
snippet STRING$\n\
	STRING$(${1:number},${2:\"string\"})\n\
snippet STRL$\n\
	STRL$(${1:number},${2:\"format_string\"})\n\
snippet SIN\n\
	SIN(${1:value})\n\
snippet SQRT\n\
	SQRT(${1:value})\n\
snippet TAN\n\
	TAN(${1:value})\n\
snippet tell\n\
	tell(#${1:device_handle})\n\
snippet ToAscii8$\n\
	ToAscii8$(${1:\"string\"})\n\
snippet toCart\n\
	toCart(${1:robot_name}, ${2:jnt_name})\n\
snippet toJoint\n\
	toJoint(${1:robot_name}, ${2:jnt_name}, ${3:config})\n\
snippet ToUTF8$\n\
	ToUTF8$(${1:\"string\"})\n\
snippet typeof\n\
	typeof(${1:\"string\"})\n\
snippet UCASE$\n\
	UCASE$(${1:\"string\"})\n\
snippet unload\n\
	unload ${1:task_name}\n\
snippet unload$\n\
	unload$ \"${1:task_name}\"\n\
snippet UTF$\n\
	UTF$(${1:unicode_value})\n\
snippet UTFSTRING$\n\
	UTFSTRING$(${1:number},${2:\"string\"})\n\
snippet val\n\
	val(${1:\"string\"})\n\
snippet While\n\
	while ${1?:condition}\n\
		${2:' Do something...}\n\
	end while\n\
";

	exports.scope = "mcbasic";
	
});
(function() {
	window.require(["ace/snippets/mcbasic"], function(m) {
		if (typeof module == "object" && typeof exports == "object" && module) {
			module.exports = m;
		}
	});
})();