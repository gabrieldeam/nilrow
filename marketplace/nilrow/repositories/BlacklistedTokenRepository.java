package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.user.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, String> {

    boolean existsByToken(String token);

    @Transactional
    @Modifying
    @Query("DELETE FROM blacklisted_token bt WHERE bt.expiresAt <= :now")
    void deleteExpiredTokens(Instant now);

}
