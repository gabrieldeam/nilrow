package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.location.Polygon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PolygonRepository extends JpaRepository<Polygon, String> {
    // Aqui você pode adicionar métodos personalizados, se necessário
}
