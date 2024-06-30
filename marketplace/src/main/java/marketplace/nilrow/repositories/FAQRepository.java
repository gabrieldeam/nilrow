package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.channel.about.FAQ;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FAQRepository extends JpaRepository<FAQ, Long> {
}
