package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.Catalog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CatalogRepository extends JpaRepository<Catalog, String> {
    Optional<Catalog> findByChannelId(String channelId);
}
