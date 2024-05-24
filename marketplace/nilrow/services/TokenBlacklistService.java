package marketplace.nilrow.services;

import marketplace.nilrow.domain.user.BlacklistedToken;
import marketplace.nilrow.repositories.BlacklistedTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class TokenBlacklistService {

    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;

    public void addToBlacklist(String token, Instant expiresAt) {
        BlacklistedToken blacklistedToken = new BlacklistedToken(token, expiresAt);
        blacklistedTokenRepository.save(blacklistedToken);
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }

    @Scheduled(fixedDelay = 24 * 60 * 60 * 1000) // Executa a cada 24 horas
    public void cleanExpiredTokens() {
        blacklistedTokenRepository.deleteExpiredTokens(Instant.now());
    }
}
