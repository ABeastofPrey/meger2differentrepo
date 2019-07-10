define('ace/theme/cs', [
  'require',
  'exports',
  'module',
  'ace/lib/dom',
], function(require, exports, module) {
  exports.isDark = false;
  exports.cssClass = 'ace-cs';
  exports.cssText =
    '.ace-cs .ace_gutter {\
background: #e8e8e8;\
color: #333;\
}\
.ace-cs .ace_print-margin {\
width: 1px;\
background: #e8e8e8;\
}\
.ace-cs {\
background-color: #FFFFFF;\
color: black;\
}\
.ace-cs .ace_fold {\
background-color: #757AD8;\
}\
.ace-cs .ace_cursor {\
color: black;\
}\
.ace-cs .ace_invisible {\
color: rgb(191, 191, 191);\
}\
.ace-cs .ace_storage,\
.ace-cs .ace_keyword {\
color: blue;\
}\
.ace-cs .ace_constant.ace_buildin {\
color: rgb(88, 72, 246);\
}\
.ace-cs .ace_constant.ace_language {\
color: rgb(88, 92, 246);\
}\
.ace-cs .ace_constant.ace_library {\
color: rgb(6, 150, 14);\
}\
.ace-cs .ace_invalid {\
background-color: rgb(153, 0, 0);\
color: white;\
}\
.ace-cs .ace_support.ace_function {\
color: rgb(60, 76, 114);\
}\
.ace-cs .ace_support.ace_constant {\
color: rgb(6, 150, 14);\
}\
.ace-cs .ace_support.ace_type,\
.ace-cs .ace_support.ace_class {\
color: #009;\
}\
.ace-cs .ace_support.ace_php_tag {\
color: #f00;\
}\
.ace-cs .ace_keyword.ace_operator {\
color: rgb(104, 118, 135);\
}\
.ace-cs .ace_string {\
color: #F00;\
}\
.ace-cs .ace_comment {\
color: rgb(76, 136, 107);\
}\
.ace-cs .ace_comment.ace_doc {\
color: rgb(0, 102, 255);\
}\
.ace-cs .ace_comment.ace_doc.ace_tag {\
color: rgb(128, 159, 191);\
}\
.ace-cs .ace_constant.ace_numeric {\
color: rgb(0, 0, 205);\
}\
.ace-cs .ace_variable {\
color: #06F\
}\
.ace-cs .ace_xml-pe {\
color: rgb(104, 104, 91);\
}\
.ace-cs .ace_entity.ace_name.ace_function {\
color: #00F;\
}\
.ace-cs .ace_heading {\
color: rgb(12, 7, 255);\
}\
.ace-cs .ace_list {\
color:rgb(185, 6, 144);\
}\
.ace-cs .ace_marker-layer .ace_selection {\
background: rgb(181, 213, 255);\
}\
.ace-cs .ace_marker-layer .ace_step {\
background: rgb(252, 255, 0);\
}\
.ace-cs .ace_marker-layer .ace_stack {\
background: rgb(164, 229, 101);\
}\
.ace-cs .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgb(192, 192, 192);\
}\
.ace-cs .ace_marker-layer .ace_active-line {\
background: rgba(0, 0, 0, 0.07);\
}\
.ace-cs .ace_gutter-active-line {\
background-color : #DCDCDC;\
}\
.ace-cs .ace_marker-layer .ace_selected-word {\
background: rgb(250, 250, 255);\
border: 1px solid rgb(200, 200, 250);\
}\
.ace-cs .ace_meta.ace_tag {\
color:#009;\
}\
.ace-cs .ace_meta.ace_tag.ace_anchor {\
color:#060;\
}\
.ace-cs .ace_meta.ace_tag.ace_form {\
color:#F90;\
}\
.ace-cs .ace_meta.ace_tag.ace_image {\
color:#909;\
}\
.ace-cs .ace_meta.ace_tag.ace_script {\
color:#900;\
}\
.ace-cs .ace_meta.ace_tag.ace_style {\
color:#909;\
}\
.ace-cs .ace_meta.ace_tag.ace_table {\
color:#099;\
}\
.ace-cs .ace_string.ace_regex {\
color: rgb(255, 0, 0)\
}\
.ace-cs .ace_indent-guide {\
background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;\
}';

  var dom = require('../lib/dom');
  dom.importCssString(exports.cssText, exports.cssClass);
});
(function() {
  window.require(['ace/theme/cs'], function(m) {
    if (typeof module == 'object' && typeof exports == 'object' && module) {
      module.exports = m;
    }
  });
})();
