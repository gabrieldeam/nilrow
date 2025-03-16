package marketplace.nilrow.services;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthStateService {

    // Mapeamento em memória de state para ownerId
    private final Map<String, String> stateMapping = new ConcurrentHashMap<>();

    /**
     * Gera um state e associa ao ownerId.
     */
    public String generateState(String ownerId) {
        String state = UUID.randomUUID().toString();
        stateMapping.put(state, ownerId);
        return state;
    }

    /**
     * Recupera e remove o ownerId associado ao state.
     */
    public String consumeState(String state) {
        return stateMapping.remove(state);
    }
}
