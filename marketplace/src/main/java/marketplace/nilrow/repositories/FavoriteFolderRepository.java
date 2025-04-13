package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.favorites.FavoriteFolder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteFolderRepository extends JpaRepository<FavoriteFolder, String> {

    List<FavoriteFolder> findByPeopleId(String peopleId);
    Optional<FavoriteFolder> findByPeopleIdAndName(String peopleId, String folderName);
}