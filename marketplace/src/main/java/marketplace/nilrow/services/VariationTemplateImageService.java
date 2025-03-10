package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.product.template.ProductTemplateVariation;
import marketplace.nilrow.domain.catalog.product.template.VariationTemplateImage;
import marketplace.nilrow.domain.catalog.product.template.VariationTemplateImageDTO;
import marketplace.nilrow.repositories.ProductVariationTemplateRepository;
import marketplace.nilrow.repositories.VariationTemplateImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VariationTemplateImageService {

    // Diretório base onde as imagens de variação serão salvas
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    // Caminho default caso a imagem não seja enviada
    private static final String DEFAULT_IMAGE = "/uploads/25990a43-5546-4b25-aa4d-67da7de149af_defaultImage.png";

    @Autowired
    private VariationTemplateImageRepository variationTemplateImageRepository;

    @Autowired
    private ProductVariationTemplateRepository productTemplateVariationRepository;

    /**
     * Cria uma nova VariationTemplateImage associada a uma variação de template.
     *
     * @param variationId ID da variação de template à qual a imagem será associada.
     * @param imageFile   Arquivo da imagem (multipart).
     * @param orderIndex  Ordem desejada para a imagem (pode ser null).
     * @return DTO da imagem criada.
     * @throws IOException se ocorrer erro ao salvar o arquivo.
     */
    public VariationTemplateImageDTO create(String variationId,
                                            MultipartFile imageFile,
                                            Integer orderIndex) throws IOException {
        // Carrega a variação de template
        ProductTemplateVariation variation = productTemplateVariationRepository
                .findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variação de template não encontrada"));

        // Salva a imagem no disco
        String imageUrl = saveImage(imageFile);
        if (imageUrl.isEmpty()) {
            imageUrl = DEFAULT_IMAGE;
        }

        // Cria a entidade VariationTemplateImage
        VariationTemplateImage entity = new VariationTemplateImage();
        entity.setVariationTemplate(variation);
        entity.setImageUrl(imageUrl);
        entity.setOrderIndex(orderIndex);

        // Salva no banco
        VariationTemplateImage saved = variationTemplateImageRepository.save(entity);
        return toDTO(saved);
    }

    /**
     * Atualiza uma imagem de variação existente.
     * Substitui o arquivo no disco, se um novo arquivo for enviado.
     */
    public VariationTemplateImageDTO update(String id,
                                            MultipartFile newImageFile,
                                            Integer orderIndex) throws IOException {
        VariationTemplateImage existing = variationTemplateImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem de variação não encontrada"));

        // Se enviou um novo arquivo, apaga o antigo (se não for default) e salva o novo
        if (newImageFile != null && !newImageFile.isEmpty()) {
            deleteImageIfNotDefault(existing.getImageUrl());

            String imageUrl = saveImage(newImageFile);
            if (imageUrl.isEmpty()) {
                imageUrl = DEFAULT_IMAGE;
            }
            existing.setImageUrl(imageUrl);
        }

        // Atualiza orderIndex
        existing.setOrderIndex(orderIndex);

        VariationTemplateImage updated = variationTemplateImageRepository.save(existing);
        return toDTO(updated);
    }

    /**
     * Retorna os dados de uma imagem de variação específica (por ID).
     */
    public VariationTemplateImageDTO getById(String id) {
        VariationTemplateImage entity = variationTemplateImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem de variação não encontrada"));
        return toDTO(entity);
    }

    /**
     * Lista todas as imagens de uma variação específica (por ID da variação).
     */
    public List<VariationTemplateImageDTO> listByVariationId(String variationId) {
        List<VariationTemplateImage> images =
                variationTemplateImageRepository.findByVariationTemplateIdOrderByOrderIndexAsc(variationId);
        return images.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Deleta uma imagem de variação pelo ID, removendo também o arquivo do disco.
     */
    public void delete(String id) {
        VariationTemplateImage existing = variationTemplateImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem de variação não encontrada"));

        // Deleta fisicamente se não for default
        deleteImageIfNotDefault(existing.getImageUrl());

        // Remove do banco
        variationTemplateImageRepository.delete(existing);
    }

    // -------------------------------------------------------------
    // Métodos auxiliares para salvar/deletar arquivos
    // -------------------------------------------------------------
    private String saveImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            return "";
        }
        String uniqueFileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        String filePath = UPLOAD_DIR + uniqueFileName;
        Path path = Paths.get(filePath);

        Files.createDirectories(path.getParent()); // garante que o diretório existe
        Files.write(path, image.getBytes());       // grava o arquivo

        // Retorna a rota relativa
        return "/uploads/" + uniqueFileName;
    }

    private void deleteImageIfNotDefault(String imageUrl) {
        if (imageUrl != null && !imageUrl.equals(DEFAULT_IMAGE)) {
            String absolutePath = System.getProperty("user.dir") + imageUrl;
            try {
                Files.deleteIfExists(Paths.get(absolutePath));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    // -------------------------------------------------------------
    // Conversão Entity -> DTO
    // -------------------------------------------------------------
    private VariationTemplateImageDTO toDTO(VariationTemplateImage entity) {
        VariationTemplateImageDTO dto = new VariationTemplateImageDTO();
        dto.setId(entity.getId());
        dto.setVariationTemplateId(entity.getVariationTemplate().getId());
        dto.setImageUrl(entity.getImageUrl());
        dto.setOrderIndex(entity.getOrderIndex());
        return dto;
    }
}
