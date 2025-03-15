package marketplace.nilrow.controllers;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import marketplace.nilrow.domain.catalog.shipping.MelhorEnvioTokenEntity;
import marketplace.nilrow.repositories.MelhorEnvioTokenRepository;
import marketplace.nilrow.services.MelhorEnvioAuthService;
import marketplace.nilrow.services.MelhorEnvioAuthService.TokenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/melhorenvio")
public class MelhorEnvioAuthController {

    @Autowired
    private MelhorEnvioAuthService authService;

    @Autowired
    private MelhorEnvioTokenRepository tokenRepository;

    @Value("${app.frontend.url}")
    private String frontendBaseUrl;

    /**
     * Endpoint para iniciar o fluxo de autorização.
     * Exemplo de chamada:
     *   GET /api/melhorenvio/authorize?ownerId=CANAL123
     */
    @GetMapping("/authorize")
    public String authorize(@RequestParam(name = "ownerId", required = true) String ownerId) {
        // Ajuste os scopes de acordo com o que sua integração necessita
        String scopes = String.join(" ",
                "shipping-calculate",
                "shipping-cancel",
                "shipping-checkout",
                "shipping-companies",
                "shipping-generate",
                "shipping-preview",
                "shipping-print",
                "shipping-share",
                "shipping-tracking",
                "ecommerce-shipping"
        );

        // Use o ownerId como "state" para identificar no callback
        String state = ownerId;

        // Gera a URL de autorização
        String authorizationUrl = authService.buildAuthorizeUrl(scopes, state);

        // Opções:
        // 1) Retornar a URL para o cliente abrir no navegador
        // 2) Redirecionar usando "redirect:" + authorizationUrl
        // Exemplo: return "redirect:" + authorizationUrl;
        // Mas se não há front, você pode só retornar a URL (para testar via Postman, etc.)
        return "Abra essa URL para autorizar: \n" + authorizationUrl;
    }

    /**
     * Endpoint de callback: o Melhor Envio redireciona para cá depois que o usuário
     * aprova (ou nega) o acesso do app.
     *
     * Exemplo de callback configurado:
     *   https://SEU_NGROK/api/melhorenvio/callback
     */
    @Value("${app.frontend.url}")
    private String appFrontendUrl;

    @GetMapping("/callback")
    public void callback(@RequestParam(name = "code", required = false) String code,
                         @RequestParam(name = "error", required = false) String error,
                         @RequestParam(name = "state", required = false) String state,
                         HttpServletResponse response) throws IOException {
        if (error != null) {
            log.error("Erro na autorização: {}", error);
            response.getWriter().write("Erro na autorização: " + error);
            return;
        }

        // Tenta usar o state, mas se estiver ausente, pode recuperar de outro armazenamento (ex.: sessão)
        String ownerId = (state != null ? state : "desconhecido");

        try {
            TokenResponse tokenResponse = authService.requestAccessToken(code);

            MelhorEnvioTokenEntity tokenEntity = new MelhorEnvioTokenEntity();
            tokenEntity.setOwnerId(ownerId);
            tokenEntity.setAccessToken(tokenResponse.accessToken);
            tokenEntity.setRefreshToken(tokenResponse.refreshToken);
            tokenEntity.setExpiresIn(tokenResponse.expiresIn);
            tokenEntity.setCreatedAt(Instant.now().getEpochSecond());
            tokenRepository.save(tokenEntity);

            log.info("Autorização concedida! Owner/Canal: {}", ownerId);
        } catch (Exception e) {
            log.error("Erro ao obter token do Melhor Envio: ", e);
            response.getWriter().write("Falha ao obter token. Ver logs no servidor.");
            return;
        }

        // Após salvar o token, redireciona para a rota desejada no front-end
        response.sendRedirect(appFrontendUrl + "/channel/catalog/my/shipping/melhorenvio");
    }



    // Exemplo adicional no Controller:
    @GetMapping("/status")
    public Map<String, Boolean> status(@RequestParam("ownerId") String ownerId) {
        boolean exists = tokenRepository.findByOwnerId(ownerId).isPresent();
        return Collections.singletonMap("activated", exists);
    }

    @DeleteMapping
    public ResponseEntity<?> deactivate(@RequestBody Map<String, String> body) {
        String ownerId = body.get("ownerId");
        // Busque o token do DB e apague
        List<MelhorEnvioTokenEntity> tokens = tokenRepository.findAllByOwnerId(ownerId);
        tokenRepository.deleteAll(tokens);

        return ResponseEntity.ok().build();
    }

}
