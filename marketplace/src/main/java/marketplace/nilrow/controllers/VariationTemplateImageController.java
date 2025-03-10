package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.product.template.VariationTemplateImageDTO;
import marketplace.nilrow.services.VariationTemplateImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/variation-template-images")
public class VariationTemplateImageController {

    @Autowired
    private VariationTemplateImageService variationTemplateImageService;

    /**
     * Cria uma nova imagem de variação (POST) utilizando multipart/form-data.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VariationTemplateImageDTO> create(
            @RequestParam("variationId") String variationId,
            @RequestParam("imageFile") MultipartFile imageFile,
            @RequestParam(value = "orderIndex", required = false) Integer orderIndex
    ) throws IOException {
        VariationTemplateImageDTO created =
                variationTemplateImageService.create(variationId, imageFile, orderIndex);
        return ResponseEntity.ok(created);
    }

    /**
     * Atualiza uma imagem de variação (PUT) utilizando multipart/form-data.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VariationTemplateImageDTO> update(
            @PathVariable String id,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "orderIndex", required = false) Integer orderIndex
    ) throws IOException {
        VariationTemplateImageDTO updated =
                variationTemplateImageService.update(id, imageFile, orderIndex);
        return ResponseEntity.ok(updated);
    }

    /**
     * Busca uma imagem de variação pelo ID da imagem.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VariationTemplateImageDTO> getById(@PathVariable String id) {
        VariationTemplateImageDTO found = variationTemplateImageService.getById(id);
        return ResponseEntity.ok(found);
    }

    /**
     * Lista todas as imagens de uma variação específica (por ID da variação).
     */
    @GetMapping("/byVariation/{variationId}")
    public ResponseEntity<List<VariationTemplateImageDTO>> listByVariation(
            @PathVariable String variationId
    ) {
        List<VariationTemplateImageDTO> list =
                variationTemplateImageService.listByVariationId(variationId);
        return ResponseEntity.ok(list);
    }

    /**
     * Deleta uma imagem de variação pelo ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        variationTemplateImageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
