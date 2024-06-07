package marketplace.nilrow.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = NicknameValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidNickname {

    String message() default "Nome de usuário inválido";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String forbiddenMessage() default "O nome de usuário contém palavras proibidas";

    String consecutiveCharsMessage() default "O nome de usuário não pode conter caracteres consecutivos";
}
