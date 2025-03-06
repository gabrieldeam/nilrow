package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.product.VariationImageDTO;
import marketplace.nilrow.services.VariationImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/variation-images")
public class VariationImageController {

    @Autowired
    private VariationImageService variationImageService;

    /**
     * Cria uma nova imagem de variação (POST) utilizando multipart/form-data.
     *
     * Espera os parâmetros:
     * - variationId: ID da variação à qual a imagem será associada.
     * - imageFile: arquivo da imagem.
     * - orderIndex: (opcional) ordem para exibição.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VariationImageDTO> create(
            @RequestParam("variationId") String variationId,
            @RequestParam("imageFile") MultipartFile imageFile,
            @RequestParam(value = "orderIndex", required = false) Integer orderIndex
    ) throws IOException {
        VariationImageDTO created = variationImageService.create(variationId, imageFile, orderIndex);
        return ResponseEntity.ok(created);
    }

    /**
     * Atualiza uma imagem de variação (PUT) utilizando multipart/form-data.
     *
     * Pode receber um novo arquivo (imageFile) para substituir o atual e/ou atualizar a ordem (orderIndex).
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VariationImageDTO> update(
            @PathVariable String id,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "orderIndex", required = false) Integer orderIndex
    ) throws IOException {
        VariationImageDTO updated = variationImageService.update(id, imageFile, orderIndex);
        return ResponseEntity.ok(updated);
    }

    /**
     * Busca uma imagem de variação pelo ID da imagem.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VariationImageDTO> getById(@PathVariable String id) {
        VariationImageDTO found = variationImageService.getById(id);
        return ResponseEntity.ok(found);
    }

    /**
     * Lista todas as imagens de uma variação específica (por ID da variação).
     */
    @GetMapping("/byVariation/{variationId}")
    public ResponseEntity<List<VariationImageDTO>> listByVariation(@PathVariable String variationId) {
        List<VariationImageDTO> list = variationImageService.listByVariationId(variationId);
        return ResponseEntity.ok(list);
    }

    /**
     * Deleta uma imagem de variação pelo ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        variationImageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
