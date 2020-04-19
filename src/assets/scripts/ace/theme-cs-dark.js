define('ace/theme/cs-dark', [
    'require',
    'exports',
    'module',
    'ace/lib/dom',
  ], function(require, exports, module) {
    exports.isDark = true;
    exports.cssClass = 'ace-cs-dark';
    exports.cssText =
      '.ace-cs-dark .ace_gutter {\
  background: #333;\
  color: rgb(144,145,148);\
  }\
  .ace-cs-dark .ace_print-margin {\
  width: 1px;\
  background: #44475a;\
  }\
  .ace-cs-dark {\
  color: #f8f8f2;\
  }\
  .ace-cs-dark .ace_fold {\
  background-color: #50fa7b;\
  border-color: #f8f8f2;\
  }\
  .ace-cs-dark .ace_cursor {\
  color: #f8f8f0;\
  }\
  .ace-cs-dark .ace_invisible {\
  color: #626680;\
  }\
  .ace-cs-dark .ace_prompt {\
  color: #ccc;\
  }\
  .ace-cs-dark .ace_funcs {\
    color: #49d3f5;\
    font-weight: 500;\
  }\
  .ace-cs-dark .ace_gutter-cell { \
    cursor: pointer;\
  }\
  .ace-cs-dark .ace_gutter-cell:hover {\
    background-color: #111;\
    color: white;\
  }\
  .ace-cs-dark .ace_storage,\
  .ace-cs-dark .ace_keyword {\
  color: #79deff;\
  font-weight: 500;\
  }\
  .ace-cs-dark .ace_constant.ace_buildin {\
  color: rgb(88, 72, 246);\
  }\
  .ace-cs-dark .ace_constant.ace_language {\
  color: #79deff;\
  font-weight: 500;\
  }\
  .ace-cs-dark .ace_constant.ace_library {\
  color: #bd93f9;\
  }\
  .ace-cs-dark .ace_invalid {\
  background-color: #79deff;\
  color: #F8F8F0;\
  }\
  .ace-cs-dark .ace_support.ace_function {\
  color: #50fa7b;\
  font-weight: 500;\
  }\
  .ace-cs-dark .ace_support.ace_constant {\
  color: #bd93f9;\
  }\
  .ace-cs-dark .ace_support.ace_type,\
  .ace-cs-dark .ace_support.ace_class {\
  color: #66d9ef;\
  }\
  .ace-cs-dark .ace_support.ace_php_tag {\
  color: #f1fa8c;\
  }\
  .ace-cs-dark .ace_keyword.ace_operator {\
  color: #c7cfd9;\
  }\
  .ace-cs-dark .ace_string {\
  color: #f1fa8c;\
  }\
  .ace-cs-dark .ace_comment {\
  color: #67996c;\
  }\
  .ace-cs-dark .ace_comment.ace_doc {\
  color: rgb(0, 102, 255);\
  }\
  .ace-cs-dark .ace_comment.ace_doc.ace_tag {\
  color: rgb(128, 159, 191);\
  }\
  .ace-cs-dark .ace_constant.ace_numeric {\
  color: rgb(0, 0, 205);\
  }\
  .ace-cs-dark .ace_variable {\
  color: #06F\
  }\
  .ace-cs-dark .ace_xml-pe {\
  color: rgb(104, 104, 91);\
  }\
  .ace-cs-dark .ace_entity.ace_name.ace_function {\
  color: #79deff;\
  }\
  .ace-cs-dark .ace_heading {\
  color: rgb(12, 7, 255);\
  }\
  .ace-cs-dark .ace_list {\
  color:rgb(185, 6, 144);\
  }\
  .ace-cs-dark .ace_marker-layer .ace_selection {\
  background: #666;\
  }\
  .ace-cs-dark .ace_marker-layer .ace_step {\
  background: rgb(252, 255, 0);\
  }\
  .ace-cs-dark .ace_marker-layer .ace_stack {\
  background: rgb(164, 229, 101);\
  }\
  .ace-cs-dark .ace_marker-layer .ace_bracket {\
  margin: -1px 0 0 -1px;\
  border: 1px solid rgb(192, 192, 192);\
  }\
  .ace-cs-dark .ace_marker-layer .ace_active-line {\
  background: rgba(0, 0, 0, 0.07);\
  }\
  .ace-cs-dark .ace_gutter-active-line {\
  background-color : #111;\
  }\
  .ace-cs-dark .ace_marker-layer .ace_selected-word {\
  background: rgb(250, 250, 255);\
  border: 1px solid rgb(200, 200, 250);\
  }\
  .ace-cs-dark .ace_meta.ace_tag {\
  color:#009;\
  }\
  .ace-cs-dark .ace_meta.ace_tag.ace_anchor {\
  color:#060;\
  }\
  .ace-cs-dark .ace_meta.ace_tag.ace_form {\
  color:#F90;\
  }\
  .ace-cs-dark .ace_meta.ace_tag.ace_image {\
  color:#909;\
  }\
  .ace-cs-dark .ace_meta.ace_tag.ace_script {\
  color:#900;\
  }\
  .ace-cs-dark .ace_meta.ace_tag.ace_style {\
  color:#909;\
  }\
  .ace-cs-dark .ace_meta.ace_tag.ace_table {\
  color:#099;\
  }\
  .ace-cs-dark .ace_string.ace_regex {\
  color: #f1fa8c;\
  }\
  .ace-cs-dark .ace_indent-guide {\
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNgYGBgYHB3d/8PAAOIAdULw8qMAAAAAElFTkSuQmCC) right repeat-y;\
  }';
  
    var dom = require('../lib/dom');
    dom.importCssString(exports.cssText, exports.cssClass);
  });
  (function() {
    window.require(['ace/theme/cs-dark'], function(m) {
      if (typeof module == 'object' && typeof exports == 'object' && module) {
        module.exports = m;
      }
    });
  })();
  