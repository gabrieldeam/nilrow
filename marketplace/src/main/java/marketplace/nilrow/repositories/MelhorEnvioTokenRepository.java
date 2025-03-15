package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.shipping.MelhorEnvioTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MelhorEnvioTokenRepository extends JpaRepository<MelhorEnvioTokenEntity, String> {

    // Retorna um token (se houver) para o ownerId informado.
    Optional<MelhorEnvioTokenEntity> findByOwnerId(String ownerId);

    // Retorna todos os tokens (caso haja mais de um) para o ownerId informado.
    List<MelhorEnvioTokenEntity> findAllByOwnerId(String ownerId);
}
