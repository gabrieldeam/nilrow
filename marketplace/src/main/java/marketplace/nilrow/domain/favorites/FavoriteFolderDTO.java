package marketplace.nilrow.domain.favorites;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import marketplace.nilrow.domain.catalog.product.ProductDTO;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteFolderDTO {

    private String id;
    private String name;
    private String peopleId; // Dono da pasta
    private List<ProductDTO> productsPreview; // IDs dos produtos contidos na pasta
}