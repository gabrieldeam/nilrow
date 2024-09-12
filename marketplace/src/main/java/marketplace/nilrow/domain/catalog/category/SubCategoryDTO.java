package marketplace.nilrow.domain.catalog.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoryDTO {

    private String id;
    private String name;
    private String categoryId;
}