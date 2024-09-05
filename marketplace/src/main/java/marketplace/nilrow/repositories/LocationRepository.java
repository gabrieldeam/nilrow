package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.location.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, String> {
    List<Location> findByCatalogId(String catalogId);
}
