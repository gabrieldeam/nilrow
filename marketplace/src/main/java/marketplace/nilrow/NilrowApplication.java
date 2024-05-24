package marketplace.nilrow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication(scanBasePackages = "marketplace.nilrow")
@EntityScan(basePackages = "marketplace.nilrow.domain.*")
@EnableJpaRepositories(basePackages = "marketplace.nilrow.repositories")
@EnableTransactionManagement
public class NilrowApplication {

	public static void main(String[] args) {
		SpringApplication.run(NilrowApplication.class, args);
	}

}
