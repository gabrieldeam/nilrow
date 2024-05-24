package marketplace.nilrow.infra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CustomExceptionHandler {

    @ExceptionHandler(DuplicateFieldException.class)
    public ResponseEntity<ExceptionDTO> handleDuplicateFieldException(DuplicateFieldException ex) {
        String message = String.format("%s already exists", ex.getField());
        ExceptionDTO response = new ExceptionDTO(message, HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

}
