package marketplace.nilrow.domain.catalog.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCategoryOrderDTO {

    private String id;
    private String userId;
    private String categoryId;
    private int displayOrder;
}