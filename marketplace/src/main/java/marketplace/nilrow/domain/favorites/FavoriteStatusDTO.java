package marketplace.nilrow.domain.favorites;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class FavoriteStatusDTO {
    private boolean favorited;      // se o produto está em *alguma* pasta
    private List<String> folders;   // nomes das pastas onde ele está
}