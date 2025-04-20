package marketplace.nilrow.domain.favorites;

import jakarta.validation.constraints.NotBlank;

public record RenameFolderRequest(
        @NotBlank(message = "O novo nome não pode estar em branco")
        String newName
) {}
