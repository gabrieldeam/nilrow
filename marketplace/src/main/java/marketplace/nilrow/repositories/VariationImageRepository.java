package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.product.VariationImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VariationImageRepository extends JpaRepository<VariationImage, String> {

    // Se quiser listar todas as imagens de uma variação específica:
    List<VariationImage> findByVariationIdOrderByOrderIndexAsc(String variationId);

    // Ou findByVariationId se quiser sem orderIndex
}
