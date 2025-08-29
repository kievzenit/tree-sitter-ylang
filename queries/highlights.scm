[
  "package"
  "export"
  "extern"
  "static"
  "type"
  "public"
  "private"
  "fun"
  "let"
  "const"
  "loop"
  "while"
  "do"
  "for"
  "if"
  "else"
  "continue"
  "break"
  "breakall"
  "return"
] @keyword

[
  ">-"
  "++"
  "--"
  "!"
  "~"
  "&&"
  "||"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "+"
  "-"
  "/"
  "%"
  "&"
  "|"
  "^"
  ">>"
  "<<"
  "="
  "+="
  "-="
  "*="
  "/="
  "%="
  "|="
  "&="
  "^="
  ">>="
  "<<="
] @operator

(binary_expression operator: "*" @operator)
(prefix_expression operator: "*" @operator)

(comment) @comment

(type_identifier) @type
(builtin_type) @type.builtin

(integer_expression
  (integer_literal) @number
  type: (integer_type) @type.builtin)
(float_expression
  (float_literal) @number.float
  type: (float_type) @type.builtin)
(string_expression) @string
(char_expression) @string.character
(boolean_expression) @constant.builtin

(identifier_expression) @variable

(call_expression name: (identifier_expression) @function)
(member_call_expression name: (identifier_expression) @function.method)
(member_access_expression member: (identifier_expression) @property)

(variable_declaration_statement
  kind: "const"
  name: (identifier_expression) @variable.readonly)

(variable_declaration_statement
  kind: "let"
  name: (identifier_expression) @variable)

(for_init_variable
  kind: "const"
  name: (identifier_expression) @variable.readonly)

(for_init_variable
  kind: "let"
  name: (identifier_expression) @variable)

(variable_declaration
  kind: "const"
  name: (identifier_expression) @variable.readonly)

(variable_declaration
  kind: "let"
  name: (identifier_expression) @variable)

(function_declaration
  name: (identifier_expression) @function
  argument: (function_argument name: (identifier_expression) @parameter))

(member_declaration name: (identifier_expression) @property)

(type_declaration name: (identifier_expression) @class)

(package_declaration name: (package_name) @namespace)
