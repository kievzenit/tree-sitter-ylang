/**
 * @file Parser for ylang that adds syntax highlighting
 * @author kievzenit <kir.backender@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "ylang",

  extras: $ => [
    $.comment,
    /\s/
  ],
  rules: {
    source_file: $ => seq(
      $.package_declaration,
      repeat($._top_statement),
    ),

    package_declaration: $ => seq(
      "package",
      field("name", $.package_name),
      ";"
    ),

    package_name: $ => seq(
      $._identifier_literal,
      repeat(seq("::", $._identifier_literal))
    ),

    _top_statement: $ => seq(
      optional(choice("export", "extern")),
      choice(
        $.type_declaration,
        $.function_declaration,
        $.variable_declaration,
      ),
    ),

    type_declaration: $ => seq(
      "type",
      field("name", $.identifier_expression),
      "{",
      repeat(
        seq(
          $.access_modifier,
          ":",
          repeat1(choice($.member_declaration, $.function_declaration,))
        ),
      ),
      "}"
    ),
    access_modifier: $ => choice("public", "private",),
    member_declaration: $ => seq(
      field("name", $.identifier_expression),
      ":",
      field("type", $._type_identifier),
      ";"
    ),

    function_declaration: $ => seq(
      "fun",
      field("name", $.identifier_expression),
      "(",
      commaSep(field("argument", $.function_argument)),
      ")",
      field("return_type", $._type_identifier),
      choice(
        ";",
        $.scope_statement
      )
    ),
    function_argument: $ => seq(
      field("name", $.identifier_expression),
      ":",
      field("type", $._type_identifier)
    ),

    variable_declaration: $ => seq(
      field("kind", choice("let", "const")),
      field("name", $.identifier_expression),
      optional(seq(":", field("type", $._type_identifier))),
      "=",
      $._expression,
      ";"
    ),

    _statement: $ => choice(
      $._local_statement,
      $._control_statement,
      $._jump_statement,
      $.scope_statement,
    ),

    _control_statement: $ => choice(
      $.loop_statement,
      $.do_while_statement,
      $.while_statement,
      $.for_statement,
      $.if_statement
    ),
    loop_statement: $ => seq("loop", $.scope_statement),
    do_while_statement: $ => seq("do", $.scope_statement, "while", field("condition", $.parenthesized_expression), ";"),
    while_statement: $ => seq("while", field("condition", $.parenthesized_expression), $.scope_statement),
    for_statement: $ => seq(
      "for",
      "(",
      optional($.for_init),
      ";",
      field("condition", $._expression),
      ";",
      optional($.for_after_each),
      ")",
      $.scope_statement,
    ),
    for_init: $ => commaSep1(choice(
      $.for_init_variable,
      $._expression
    )),
    for_init_variable: $ => seq(
      optional("static"),
      field("kind", choice("let", "const")),
      field("name", $.identifier_expression),
      optional(seq(":", field("type", $._type_identifier))),
      "=",
      $._expression,
    ),
    for_after_each: $ => commaSep1($._expression),
    if_statement: $ => seq(
      "if",
      field("condition", $.parenthesized_expression),
      $.scope_statement,
      repeat($.else_if_statement),
      optional($.else_statement)
    ),
    else_if_statement: $ => seq(
      "else",
      "if",
      field("condition", $.parenthesized_expression),
      $.scope_statement
    ),
    else_statement: $ => seq(
      "else",
      $.scope_statement
    ),

    _jump_statement: $ => choice(
      $.continue_statement,
      $.break_statement,
      $.breakall_statement,
      $.return_statement
    ),
    continue_statement: $ => seq("continue", ";"),
    break_statement: $ => seq("break", ";"),
    breakall_statement: $ => seq("breakall", ";"),
    return_statement: $ => seq("return", optional($._expression), ";"),

    _local_statement: $ => choice(
      $.variable_declaration_statement,
      $.expression_statement
    ),
    variable_declaration_statement: $ => seq(
      optional("static"),
      field("kind", choice("let", "const")),
      field("name", $.identifier_expression),
      optional(seq(":", field("type", $._type_identifier))),
      "=",
      $._expression,
      ";"
    ),
    expression_statement: $ => seq(
      $._expression,
      ";"
    ),

    scope_statement: $ => seq(
      "{",
      repeat($._statement),
      "}"
    ),

    _expression: $ => choice(
      $._unary_expression,
      $.binary_expression,
      $.assignment_expression
    ),

    assignment_expression: $ => seq(
      field("left", $._unary_expression),
      field("operator", choice(
        "=",
        "+=",
        "-=",
        "*=",
        "/=",
        "%=",
        "&=",
        "|=",
        "^=",
        ">>=",
        "<<="
      )),
      field("right", $._expression)
    ),

    binary_expression: $ => choice(
      prec.left(5, seq(
        field("left", $._expression),
        field("operator", choice('&', '|', '^', '>>', '<<')),
        field("right", $._expression),
      )),
      prec.left(4, seq(
        field("left", $._expression),
        field("operator", choice('+', '-')),
        field("right", $._expression),
      )),
      prec.left(3, seq(
        field("left", $._expression),
        field("operator", choice('*', '/', "%")),
        field("right", $._expression),
      )),
      prec.left(2, seq(
        field("left", $._expression),
        field("operator", choice('==', '!=', '<', '<=', '>', '>=')),
        field("right", $._expression),
      )),
      prec.left(1, seq(
        field("left", $._expression),
        field("operator", choice('&&', '||')),
        field("right", $._expression),
      )),
    ),

    _unary_expression: $ => choice(
      $.prefix_expression,
      $.postfix_expression,
      $._primary_expression
    ),
    prefix_expression: $ => seq(
      field("operator", choice(
        "++",
        "--",
        "+",
        "-",
        "!",
        "~",
        "&",
        "*"
      )),
      $._primary_expression
    ),
    postfix_expression: $ => seq(
      $._primary_expression,
      field("operator", choice("++", "--"))
    ),

    _primary_expression: $ => choice(
      $._literal_expression,
      $.identifier_expression,
      $.parenthesized_expression,
      $.array_expression,
      $.call_expression,
      $.array_subscript_expression,
      $.member_access_expression,
      $.member_call_expression,
      $.cast_expression,
    ),

    array_subscript_expression: $ => seq(
      $._primary_expression,
      "[",
      field("index", $._expression),
      "]"
    ),
    member_access_expression: $ => seq(
      $._primary_expression,
      ".",
      field("member", $.identifier_expression)
    ),
    member_call_expression: $ => seq(
      $._primary_expression,
      ".",
      field("name", $.identifier_expression),
      "(",
      commaSep(field("argument", $._expression)),
      ")"
    ),
    cast_expression: $ => seq(
      $._primary_expression,
      ">-",
      choice(
        field("type", $._type_identifier),
        seq("{", field("name", $.identifier_expression), ":", field("type", $._type_identifier), "}")
      )
    ),

    parenthesized_expression: $ => seq(
      "(",
      $._expression,
      ")"
    ),
    array_expression: $ => seq(
      "[",
      commaSep1(field("element", $._expression)),
      "]"
    ),
    call_expression: $ => seq(
      field("name", $.identifier_expression),
      "(",
      commaSep(field("argument", $._expression)),
      ")"
    ),

    _literal_expression: $ => choice(
      $.integer_expression,
      $.float_expression,
      $.boolean_expression,
      $.string_expression,
      $.char_expression
    ),
    identifier_expression: $ => $._identifier_literal,
    integer_expression: $ => $._integer_literal,
    float_expression: $ => $._float_literal,
    string_expression: $ => $._string_literal,
    char_expression: $ => $._char_literal,
    boolean_expression: $ => $._boolean_literal,

    _type_identifier: $ => alias($._type, $.type_identifier),
    _type: $ => choice(
      $.builtin_type,
      $._complex_type
    ),

    _complex_type: $ => choice(
      $.base_type,
      $.pointer_type,
      $.array_type
    ),

    pointer_type: $ => seq("*", $._type),

    array_type: $ => seq("[", optional($._integer_literal), "]", $._type),

    base_type: $ => seq(
      $._identifier_literal,
      repeat(seq("::", $._identifier_literal))
    ),

    builtin_type: $ => choice(
      "void",
      "bool",
      "byte",
      "char",
      $.integer_type,
      $.float_type,
      "string",
    ),
    integer_type: $ => choice(
      "uint1",
      "uint8",
      "uint16",
      "uint32",
      "uint",
      "uint64",
      "uint128",
      "int8",
      "int16",
      "int32",
      "int",
      "int64",
      "int128",
      "usize",
      "isize",
    ),
    float_type: $ => choice(
      "float16",
      "float32",
      "float",
      "float64",
      "float80",
      "float128",
    ),

    _identifier_literal: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    _char_literal: $ => seq(
      "'",
      choice(
        /[^'\\\n]/,
        /\\./
      ),
      "'"
    ),
    _string_literal: $ => seq(
      '"',
      repeat(choice(
        /[^"\\\n]/,
        /\\./
      )),
      '"'
    ),
    _boolean_literal: $ => choice("true", "false"),
    _float_literal: $ => seq(/[0-9]+\.[0-9]+/, optional(seq(":", $.float_type))),
    _integer_literal: $ => choice(
      seq($._decimal_number_literal, optional(seq(":", $.integer_type))),
      $._complex_hexadecimal_literal,
      $._complex_decimal_literal,
      $._complex_octal_literal,
      $._complex_binary_literal
    ),

    _complex_hexadecimal_literal: $ => seq(
      "0x",
      repeat1($._hexadecimal_digit)
    ),
    _complex_decimal_literal: $ => seq(
      "0d",
      repeat1($._decimal_digit)
    ),
    _complex_octal_literal: $ => seq(
      "0o",
      repeat1($._octal_digit)
    ),
    _complex_binary_literal: $ => seq(
      "0b",
      repeat1($._binary_digit)
    ),
    _decimal_number_literal: $ => seq(
      $._decimal_digit,
      repeat(seq("_", $._decimal_digit))
    ),

    _hexadecimal_digit: $ => /[0-9a-fA-F]/,
    _decimal_digit: $ => /[0-9]/,
    _octal_digit: $ => /[0-7]/,
    _binary_digit: $ => /[01]/,

    comment: _ => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),
  },
});

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}
