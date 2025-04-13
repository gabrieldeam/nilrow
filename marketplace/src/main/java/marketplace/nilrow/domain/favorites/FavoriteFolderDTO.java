package marketplace.nilrow.domain.favorites;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteFolderDTO {

    private String id;
    private String name;
    private String peopleId; // Dono da pasta
    private Set<String> productIds; // IDs dos produtos contidos na pasta
}