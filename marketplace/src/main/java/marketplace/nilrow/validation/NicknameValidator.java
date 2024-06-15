package marketplace.nilrow.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;
import java.util.List;

public class NicknameValidator implements ConstraintValidator<ValidNickname, String> {

    private final List<String> forbiddenWords = Arrays.asList("admin", "root", "superuser"); // Adicione palavras proibidas conforme necessário
    private String forbiddenMessage;
    private String consecutiveCharsMessage;

    @Override
    public void initialize(ValidNickname constraintAnnotation) {
        forbiddenMessage = constraintAnnotation.forbiddenMessage();
        consecutiveCharsMessage = constraintAnnotation.consecutiveCharsMessage();
    }

    @Override
    public boolean isValid(String nickname, ConstraintValidatorContext context) {
        if (nickname == null) {
            return false;
        }

        // Verificar palavras proibidas
        for (String word : forbiddenWords) {
            if (nickname.toLowerCase().contains(word)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(forbiddenMessage).addConstraintViolation();
                return false;
            }
        }

        // Verificar caracteres consecutivos
        if (containsConsecutiveChars(nickname, 4, '.')
                || containsConsecutiveChars(nickname, 4, '_')) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(consecutiveCharsMessage).addConstraintViolation();
            return false;
        }

        return true;
    }

    private boolean containsConsecutiveChars(String str, int count, char character) {
        String repeated = new String(new char[count]).replace('\0', character);
        return str.contains(repeated);
    }
}
