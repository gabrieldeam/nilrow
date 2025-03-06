package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.product.ProductVariation;
import marketplace.nilrow.domain.catalog.product.VariationImage;
import marketplace.nilrow.domain.catalog.product.VariationImageDTO;
import marketplace.nilrow.repositories.ProductVariationRepository;
import marketplace.nilrow.repositories.VariationImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VariationImageService {

    // Diretório base onde as imagens do produto serão salvas
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    // Caminho default caso a imagem não seja enviada
    private static final String DEFAULT_IMAGE = "/uploads/25990a43-5546-4b25-aa4d-67da7de149af_defaultImage.png";

    @Autowired
    private VariationImageRepository variationImageRepository;

    @Autowired
    private ProductVariationRepository productVariationRepository;

    /**
     * Cria uma nova VariationImage associada a uma variação.
     * Salva o arquivo no disco da mesma forma que o produto principal.
     *
     * @param variationId ID da variação à qual a imagem será associada.
     * @param imageFile   Arquivo da imagem.
     * @param orderIndex  Ordem desejada para a imagem.
     * @return DTO da imagem criada.
     * @throws IOException se ocorrer erro de IO.
     */
    public VariationImageDTO create(String variationId, MultipartFile imageFile, Integer orderIndex) throws IOException {
        // Carrega a variação
        ProductVariation variation = productVariationRepository.findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variação não encontrada"));

        String imageUrl = saveImage(imageFile);
        if (imageUrl.isEmpty()) {
            imageUrl = DEFAULT_IMAGE;
        }

        VariationImage entity = new VariationImage();
        entity.setVariation(variation);
        entity.setImageUrl(imageUrl);
        entity.setOrderIndex(orderIndex);

        VariationImage saved = variationImageRepository.save(entity);
        return toDTO(saved);
    }

    /**
     * Atualiza uma imagem existente.
     * Se um novo arquivo for fornecido, substitui o arquivo antigo (excluindo-o do disco).
     *
     * @param id           ID da imagem a ser atualizada.
     * @param newImageFile Novo arquivo da imagem (pode ser null ou vazio para não atualizar).
     * @param orderIndex   Nova ordem desejada para a imagem.
     * @return DTO atualizado.
     * @throws IOException se ocorrer erro de IO.
     */
    public VariationImageDTO update(String id, MultipartFile newImageFile, Integer orderIndex) throws IOException {
        VariationImage existing = variationImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem de variação não encontrada"));

        if (newImageFile != null && !newImageFile.isEmpty()) {
            // Exclui o arquivo antigo, se não for o DEFAULT_IMAGE
            deleteImageIfNotDefault(existing.getImageUrl());

            String imageUrl = saveImage(newImageFile);
            if (imageUrl.isEmpty()) {
                imageUrl = DEFAULT_IMAGE;
            }
            existing.setImageUrl(imageUrl);
        }
        existing.setOrderIndex(orderIndex);

        VariationImage updated = variationImageRepository.save(existing);
        return toDTO(updated);
    }

    /**
     * Retorna os dados de uma imagem de variação específica (por ID).
     */
    public VariationImageDTO getById(String id) {
        VariationImage entity = variationImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem de variação não encontrada"));
        return toDTO(entity);
    }

    /**
     * Lista todas as imagens de uma variação pelo ID da variação.
     */
    public List<VariationImageDTO> listByVariationId(String variationId) {
        List<VariationImage> images = variationImageRepository.findByVariationIdOrderByOrderIndexAsc(variationId);
        return images.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Deleta uma imagem específica (por ID), removendo também o arquivo do disco.
     */
    public void delete(String id) {
        VariationImage existing = variationImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagem de variação não encontrada"));
        deleteImageIfNotDefault(existing.getImageUrl());
        variationImageRepository.delete(existing);
    }

    // -------------------------------------------------------------
    // Métodos auxiliares para salvar e deletar arquivos
    // -------------------------------------------------------------

    /**
     * Salva o arquivo da imagem no disco e retorna a URL relativa.
     */
    private String saveImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            return "";
        }
        String uniqueFileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        String filePath = UPLOAD_DIR + uniqueFileName;
        Path path = Paths.get(filePath);

        // Cria o diretório, se necessário
        Files.createDirectories(path.getParent());
        // Escreve o arquivo no disco
        Files.write(path, image.getBytes());

        // Retorna a URL relativa (ex: "/uploads/arquivo.ext")
        return "/uploads/" + uniqueFileName;
    }

    /**
     * Deleta o arquivo do disco se a URL não for o DEFAULT_IMAGE.
     */
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
    // Método auxiliar para conversão Entity <-> DTO
    // -------------------------------------------------------------
    private VariationImageDTO toDTO(VariationImage entity) {
        VariationImageDTO dto = new VariationImageDTO();
        dto.setId(entity.getId());
        dto.setVariationId(entity.getVariation().getId());
        dto.setImageUrl(entity.getImageUrl());
        dto.setOrderIndex(entity.getOrderIndex());
        return dto;
    }
}
