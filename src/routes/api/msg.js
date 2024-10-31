module.exports = {
    // Titles
    TITLE_INCORRECT_DATA: "Dados incorretos e/ou faltando",
    TITLE_INCORRECT_DATA_TYPES: "Tipos dos dados incorretos",
    TITLE_ROOM_NOT_FOUND: "Quarto não encontrado",

    TITLE_USER_NOT_FOUND: "Usuário não encontrado",
    TITLE_INCORRECT_PASSWORD: "Senha incorreta",
    TITLE_MISSING_AUTH_TOKEN: "Token de autorização faltando",
    TITLE_INVALID_OR_EXPIRED_AUTH_TOKEN: "Token de autorização inválido ou expirado",

    TITLE_THERE_MUST_BE_AT_LEAST_ONE_GUEST: "Deve ter pelo menos um hóspede na reserva",
    TITLE_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY_IN: "Data do check-out não pode ser antes ou no mesmo dia do check-in",
    TITLE_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY_TODAY: "Data do check-out não pode ser antes ou no mesmo dia de hoje",
    TITLE_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY_OTHER: "Data do check-out não pode ser antes ou no mesmo dia do check-out anterior",
    
    TITLE_ROOM_IS_AVAILABLE: "O quarto está disponível",
    TITLE_ROOM_IS_ALREADY_AVAILABLE: "O quarto já está disponível",

    TITLE_ROOM_IS_RESERVED: "O quarto está reservado",
    TITLE_ROOM_IS_ALREADY_RESERVED: "O quarto já está reservado",

    TITLE_ROOM_IS_OCCUPIED: "O quarto está ocupado",
    TITLE_ROOM_IS_ALREADY_OCCUPIED: "O quarto já está ocupado",

    TITLE_ROOM_IS_IN_DEBT: "O quarto está com contas a pagar",
    TITLE_ROOMS_CHECK_OUT_IS_NOT_TODAY: "O check-out deste quarto não está definido para hoje",

    TITLE_CHARGEBACK_NOT_SET: "O modo de estorno não foi definido",

    TITLE_AMOUNT_MUST_BE_GREATER_THAN_ZERO: "O valor a ser pago precisa ser superior a zero",
    TITLE_INVALID_PAYMENT_METHOD: "Método de pagamento inválido",

    TITLE_THERE_MUST_BE_ONE_ADMIN: "Deve ter pelo menos um usuário administrador",
    TITLE_EMAILS_MUST_BE_UNIQUE: "E-mails devem ser únicos",

    TITLE_PASSWORD_REQUIRED: "Senha necessária",
    TITLE_CANNOT_CHANGE_OWN_ROLE: "Não é possível alterar seu próprio cargo",
    TITLE_CANNOT_CHANGE_OWN_EMAIL: "Não é possível alterar seu próprio e-mail",
    TITLE_CANNOT_CHANGE_USER_ROLE_SAME_HIGHER: "Esse usuário possui o mesmo ou cargo maior que o seu",

    TITLE_INVALID_EMAIL: "E-mail inválido",

    // Messages
    MSG_INCORRECT_DATA: "Certifique-se de que todos os campos estão preenchidos corretamente.",
    MSG_INCORRECT_DATA_GUESTS: "Certifique-se de que todos os campos dos dados dos hóspedes estão preenchidos corretamente.",
    MSG_INCORRECT_DATA_NAME: "O nome de um hóspede apenas pode ter letras e espaços.",

    MSG_USER_NOT_FOUND: "Não há usuários com esse e-mail. Verifique se o e-mail digitado está correto.",
    MSG_INCORRECT_PASSWORD: "Verifique se digitou a senha corretamente.",
    MSG_MISSING_AUTH_TOKEN: "Por favor providencie um token de autorização.",
    MSG_INVALID_OR_EXPIRED_AUTH_TOKEN: "Providencie um token de autorização válido ou faça login novamente.",

    MSG_INCORRECT_DATA_TYPES: "Certifique-se de que todos os tipos dos dados estão corretos.",
    MSG_INCORRECT_DATA_TYPES_GUESTS: "Certifique-se de que todos os tipos dos dados dos hóspedes estão corretos.",

    MSG_ROOM_NOT_FOUND: "Certifique-se de que o número do quarto foi digitado corretamente.",

    MSG_ROOM_IS_AVAILABLE_DEF_CHECK_OUT: "Não é possível editar a data do check-out, pois o quarto está vago. Ele precisa estar ocupado.",
    MSG_ROOM_IS_AVAILABLE_DEBT: "Não é possível visualizar a conta de um quarto vago. Ele precisa estar ocupado.",
    MSG_ROOM_IS_AVAILABLE_EDIT: "Não é possível editar a reserva, pois o quarto está vago. Tente fazer a reserva.",
    MSG_ROOM_IS_AVAILABLE_PAY: "Não é possível efetuar pagamentos, pois o quarto está vago. Ele precisa estar ocupado.",
    MSG_ROOM_IS_ALREADY_AVAILABLE_CANCEL: "Não há necessidade de cancelar a reserva.",
    MSG_ROOM_IS_ALREADY_AVAILABLE_CHECK_IN: "Não é possível efetuar check-in neste quarto, tente reservá-lo antes.",
    MSG_ROOM_IS_ALREADY_AVAILABLE_CHECK_OUT: "Não há necessidade de efetuar check-out neste quarto, pois ele já está disponível.",

    MSG_ROOM_IS_RESERVED_CHECK_OUT: "Não é possível efetuar check-out neste quarto, pois ele está reservado. Tente cancelar a reserva.",
    MSG_ROOM_IS_RESERVED_DEF_CHECK_OUT: "Não é possível editar a data do check-out, pois o quarto está reservado. Ele precisa estar ocupado.",
    MSG_ROOM_IS_RESERVED_DEBT: "Não é possível visualizar a conta de um quarto reservado. Ele precisa estar ocupado",
    MSG_ROOM_IS_RESERVED_PAY: "Não é possível efetuar pagamentos, pois o quarto está reservado. Ele precisa estar ocupado.",
    MSG_ROOM_IS_ALREADY_RESERVED: "Não é possível reservar este quarto, pois ele já está reservado. Tente editar a reserva.",

    MSG_ROOM_IS_OCCUPIED_CANCEL: "O quarto está ocupado; não é possível cancelar a reserva. Tente fazer um check-out.",
    MSG_ROOM_IS_OCCUPIED_RESERVATION: "O quarto está ocupado; não é possível reservá-lo ou editar a sua reserva.",
    MSG_ROOM_IS_ALREADY_OCCUPIED_CHECK_IN: "O quarto já está ocupado, não é possível efetuar check-in.",

    MSG_ROOM_IS_IN_DEBT: "Pague-a antes de efetuar check-out.",
    MSG_ROOMS_CHECK_OUT_IS_NOT_TODAY: "Espere até que o dia definido para o check-out deste quarto chegue.",

    MSG_CHARGEBACK_NOT_SET: "A conta possui sobras no pagamento, por favor selecione um modo de estorno.",

    MSG_THERE_MUST_BE_AT_LEAST_ONE_GUEST: "Adicione pelo menos um hóspede na reserva.",
    MSG_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY: "Defina o dia para o check-out para, pelo menos, um dia depois de hoje.",
    MSG_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY_OTHER: "Defina o dia para o check-out para, pelo menos, um dia depois do check-out anterior.",

    MSG_AMOUNT_MUST_BE_GREATER_THAN_ZERO: "Altere para um valor que seja superior a zero.",
    MSG_INVALID_PAYMENT_METHOD: "O método de pagamento seleciondo é inválido.",

    MSG_THERE_MUST_BE_ONE_ADMIN: "Adicione pelo menos, um usuário com este cargo.",
    MSG_EMAILS_MUST_BE_UNIQUE: "Existem dois usuários com o mesmo endereço de e-mail. Troque-os.",

    MSG_CANNOT_CHANGE_OWN_ROLE: "É permitido alterar o cargo de um usuário com um cargo menor que o seu apenas.",
    MSG_CANNOT_CHANGE_OWN_EMAIL: "É permitido alterar o e-mail de um usuário com um cargo menor que o seu apenas.",
    MSG_CANNOT_CHANGE_USER_ROLE_SAME_HIGHER: "É permitido alterar um usuário com um cargo menor que o seu, ou o seu usuário, apenas.",

    MSG_INVALID_EMAIL: "Um e-mail deve ter um '@' e um domínio após ele.",
};
