package marketplace.nilrow.domain.catalog.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {

    private String id;
    private String name;
    private String imageUrl;
    private List<CategoryDTO> subcategories;

}