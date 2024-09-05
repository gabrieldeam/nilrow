package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.location.Coordinate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoordinateRepository extends JpaRepository<Coordinate, String> {
    // Aqui você pode adicionar métodos personalizados, se necessário
}
