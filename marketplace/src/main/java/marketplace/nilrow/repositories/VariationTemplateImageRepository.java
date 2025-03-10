package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.product.VariationImage;
import marketplace.nilrow.domain.catalog.product.template.VariationTemplateImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VariationTemplateImageRepository extends JpaRepository<VariationTemplateImage, String> {

    List<VariationTemplateImage> findByVariationTemplateIdOrderByOrderIndexAsc(String variationTemplateId);

}
