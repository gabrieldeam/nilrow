package marketplace.nilrow.domain.catalog.product.brand;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BrandDTO {
    private String id;

    @NotBlank(message = "O nome da marca é obrigatório")
    private String name;
}