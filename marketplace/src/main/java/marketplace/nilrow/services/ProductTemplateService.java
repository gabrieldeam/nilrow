package marketplace.nilrow.services;

import jakarta.transaction.Transactional;
import marketplace.nilrow.domain.catalog.product.template.*;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.brand.Brand;
import marketplace.nilrow.repositories.ProductTemplateRepository;
import marketplace.nilrow.repositories.CategoryRepository;
import marketplace.nilrow.repositories.SubCategoryRepository;
import marketplace.nilrow.repositories.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductTemplateService {

    // Diretório base onde as imagens do produto serão salvas
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    // Caminho default caso o produto não possua imagens
    private static final String DEFAULT_IMAGE = "/uploads/defaultImage.png";

    @Autowired
    private ProductTemplateRepository productTemplateRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    /**
     * Cria um novo ProductTemplate (com variações e specs), salvando imagens principais.
     */
    @Transactional
    public ProductTemplateDTO createProductTemplate(
            ProductTemplateDTO dto,
            List<MultipartFile> productImages
    ) throws IOException {

        // 1) Criar entidade e mapear do DTO
        ProductTemplate productTemplate = new ProductTemplate();
        mapDtoToEntity(dto, productTemplate);

        // 2) Salvar imagens do template
        List<String> productImagePaths = saveImages(productImages);
        if (productImagePaths.isEmpty()) {
            productTemplate.setImages(List.of(DEFAULT_IMAGE));
        } else {
            productTemplate.setImages(productImagePaths);
        }

        // 3) Especificações Técnicas
        if (dto.getTechnicalSpecifications() != null) {
            List<TechnicalSpecificationTemplate> specs = dto.getTechnicalSpecifications().stream()
                    .map(specDTO -> {
                        TechnicalSpecificationTemplate spec = new TechnicalSpecificationTemplate();
                        spec.setTitle(specDTO.getTitle());
                        spec.setContent(specDTO.getContent());
                        spec.setProductTemplate(productTemplate);
                        return spec;
                    })
                    .collect(Collectors.toList());
            productTemplate.setTechnicalSpecifications(specs);
        }

        // 4) Variações
        if (dto.getVariations() != null && !dto.getVariations().isEmpty()) {
            List<ProductTemplateVariation> variations = new ArrayList<>();
            for (ProductTemplateVariationDTO varDTO : dto.getVariations()) {
                ProductTemplateVariation variation = new ProductTemplateVariation();
                variation.setName(varDTO.getName());
                variation.setProductTemplate(productTemplate);

                // Atributos
                if (varDTO.getAttributes() != null) {
                    List<VariationTemplateAttribute> attrs = varDTO.getAttributes().stream()
                            .map(attrDTO -> {
                                VariationTemplateAttribute attr = new VariationTemplateAttribute();
                                attr.setAttributeName(attrDTO.getAttributeName());
                                attr.setAttributeValue(attrDTO.getAttributeValue());
                                attr.setVariationTemplate(variation);
                                return attr;
                            })
                            .collect(Collectors.toList());
                    variation.setAttributes(attrs);
                }
                // Imagens da variação não estão sendo salvas aqui (depende se você quer gerenciar)

                variations.add(variation);
            }
            productTemplate.setVariations(variations);
        }

        // Salva no banco
        ProductTemplate saved = productTemplateRepository.save(productTemplate);

        // Converte pra DTO e retorna
        return convertToDTO(saved);
    }

    /**
     * Atualiza um ProductTemplate existente, atualizando imagens principais e dados básicos.
     */
    @Transactional
    public ProductTemplateDTO updateProductTemplate(
            String id,
            ProductTemplateDTO dto,
            List<MultipartFile> productImages
    ) throws IOException {

        // 1) Carrega do banco
        ProductTemplate productTemplate = productTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));

        // 2) Atualiza campos
        mapDtoToEntity(dto, productTemplate);

        // 3) Atualiza imagens principais
        updateTemplateImages(productTemplate, dto.getImages(), productImages);

        // 4) Atualiza specs
        updateTechnicalSpecifications(productTemplate, dto.getTechnicalSpecifications());

        // 5) Atualiza variações
        updateProductTemplateVariations(productTemplate, dto.getVariations());

        // 6) Salva e retorna
        ProductTemplate updated = productTemplateRepository.save(productTemplate);
        return convertToDTO(updated);
    }

    /**
     * Deleta completamente o ProductTemplate e suas imagens principais.
     * (Se quiser deletar imagens de variação, ajuste aqui.)
     */
    @Transactional
    public void deleteProductTemplate(String id) {
        ProductTemplate productTemplate = productTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));

        // Deleta imagens principais
        deleteImages(productTemplate.getImages());

        // Deleta do banco
        productTemplateRepository.delete(productTemplate);
    }

    /**
     * Busca um template pelo ID e converte a DTO.
     */
    public ProductTemplateDTO getProductTemplateById(String id) {
        ProductTemplate productTemplate = productTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        return convertToDTO(productTemplate);
    }

    /**
     * Faz pesquisa paginada por nome ou skuCode.
     */
    @Transactional
    public Page<ProductTemplateDTO> searchProductTemplates(String term, Pageable pageable) {
        Page<ProductTemplate> page = productTemplateRepository
                .findByNameContainingIgnoreCase(term, pageable);
        return page.map(this::convertToDTO);
    }

    /**
     * Lista todos os templates com paginação.
     */
    public Page<ProductTemplateDTO> listAllProductTemplates(Pageable pageable) {
        Page<ProductTemplate> page = productTemplateRepository.findAll(pageable);
        return page.map(this::convertToDTO);
    }

    // -----------------------------------------------------------
    // MÉTODOS AUXILIARES
    // -----------------------------------------------------------

    /**
     * Copia campos do DTO para a entidade (exceto specs e variações).
     */
    private void mapDtoToEntity(ProductTemplateDTO dto, ProductTemplate productTemplate) {
        productTemplate.setName(dto.getName());
        productTemplate.setWidth(dto.getWidth());
        productTemplate.setHeight(dto.getHeight());
        productTemplate.setDepth(dto.getDepth());
        productTemplate.setVolumes(dto.getVolumes());

        productTemplate.setNetWeight(dto.getNetWeight());
        productTemplate.setGrossWeight(dto.getGrossWeight());
        productTemplate.setItemsPerBox(dto.getItemsPerBox());
        productTemplate.setShortDescription(dto.getShortDescription());
        productTemplate.setComplementaryDescription(dto.getComplementaryDescription());
        productTemplate.setNotes(dto.getNotes());
        productTemplate.setType(dto.getType());

        // Relacionamentos
        categoryRepository.findById(dto.getCategoryId())
                .ifPresentOrElse(productTemplate::setCategory,
                        () -> { throw new RuntimeException("Categoria não encontrada"); });

        subCategoryRepository.findById(dto.getSubCategoryId())
                .ifPresentOrElse(productTemplate::setSubCategory,
                        () -> { throw new RuntimeException("Subcategoria não encontrada"); });

        brandRepository.findById(dto.getBrandId())
                .ifPresentOrElse(productTemplate::setBrand,
                        () -> { throw new RuntimeException("Marca não encontrada"); });
    }

    /**
     * Salva as novas imagens no disco e retorna suas URLs.
     */
    private List<String> saveImages(List<MultipartFile> images) throws IOException {
        List<String> imagePaths = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String uniqueFileName = UUID.randomUUID().toString()
                            + "_" + image.getOriginalFilename();
                    String filePath = UPLOAD_DIR + uniqueFileName;
                    Path path = Paths.get(filePath);

                    Files.createDirectories(path.getParent()); // garante existência
                    Files.write(path, image.getBytes());       // salva

                    imagePaths.add("/uploads/" + uniqueFileName);
                }
            }
        }
        return imagePaths;
    }

    /**
     * Atualiza a lista de imagens principais do Template.
     * Se alguma URL antiga foi removida do DTO, ela é apagada do disco.
     */
    private void updateTemplateImages(ProductTemplate productTemplate,
                                      List<String> desiredUrls,
                                      List<MultipartFile> newImages) throws IOException {

        List<String> oldUrls = (productTemplate.getImages() == null)
                ? new ArrayList<>()
                : new ArrayList<>(productTemplate.getImages());

        // URLs que o DTO ainda mantém
        List<String> desired = (desiredUrls == null) ? new ArrayList<>() : desiredUrls;

        // Acha as removidas
        List<String> removedUrls = oldUrls.stream()
                .filter(url -> !desired.contains(url))
                .collect(Collectors.toList());

        // Remove do disco as removidas (exceto se default)
        for (String removedUrl : removedUrls) {
            deleteImageIfNotDefault(removedUrl);
        }

        // Novas URLs começam com as desired
        List<String> finalUrls = new ArrayList<>(desired);

        // Faz upload das novas
        List<String> newUploaded = saveImages(newImages);
        finalUrls.addAll(newUploaded);

        // Se ficou vazio, bota default
        if (finalUrls.isEmpty()) {
            finalUrls = List.of(DEFAULT_IMAGE);
        }

        productTemplate.setImages(finalUrls);
    }

    /**
     * Atualiza especificações técnicas (TechnicalSpecificationTemplate).
     */
    private void updateTechnicalSpecifications(ProductTemplate productTemplate,
                                               List<TechnicalSpecificationTemplateDTO> specsDTO) {
        List<TechnicalSpecificationTemplate> existingSpecs =
                (productTemplate.getTechnicalSpecifications() == null)
                        ? new ArrayList<>()
                        : productTemplate.getTechnicalSpecifications();

        Map<String, TechnicalSpecificationTemplate> existingMap = existingSpecs.stream()
                .collect(Collectors.toMap(TechnicalSpecificationTemplate::getId, s -> s));

        Set<String> specsToKeep = new HashSet<>();

        if (specsDTO != null) {
            for (TechnicalSpecificationTemplateDTO dto : specsDTO) {
                if (dto.getId() != null && existingMap.containsKey(dto.getId())) {
                    // Atualiza
                    TechnicalSpecificationTemplate existing = existingMap.get(dto.getId());
                    existing.setTitle(dto.getTitle());
                    existing.setContent(dto.getContent());
                    specsToKeep.add(dto.getId());
                } else {
                    // Cria nova
                    TechnicalSpecificationTemplate newSpec = new TechnicalSpecificationTemplate();
                    newSpec.setTitle(dto.getTitle());
                    newSpec.setContent(dto.getContent());
                    newSpec.setProductTemplate(productTemplate);
                    existingSpecs.add(newSpec);
                }
            }
        }
        // Remove as specs que não constam mais
        existingSpecs.removeIf(spec ->
                spec.getId() != null && !specsToKeep.contains(spec.getId()));

        productTemplate.setTechnicalSpecifications(existingSpecs);
    }

    /**
     * Atualiza variações, sem lidar com imagens de variação (se desejar, pode incluir).
     */
    private void updateProductTemplateVariations(
            ProductTemplate productTemplate,
            List<ProductTemplateVariationDTO> variationDTOs
    ) {
        // Se não tem variações no DTO, limpa tudo
        if (variationDTOs == null || variationDTOs.isEmpty()) {
            if (productTemplate.getVariations() != null) {
                productTemplate.getVariations().clear();
            }
            return;
        }

        if (productTemplate.getVariations() == null) {
            productTemplate.setVariations(new ArrayList<>());
        }

        // Vamos criar nova lista final
        List<ProductTemplateVariation> finalVariations = new ArrayList<>();

        // Simples: reescreve tudo
        for (ProductTemplateVariationDTO varDTO : variationDTOs) {
            // Tenta achar var com mesmo ID (caso exista)
            ProductTemplateVariation existing = null;
            if (varDTO.getId() != null) {
                existing = productTemplate.getVariations().stream()
                        .filter(v -> varDTO.getId().equals(v.getId()))
                        .findFirst().orElse(null);
            }

            ProductTemplateVariation variation = (existing == null)
                    ? new ProductTemplateVariation()
                    : existing;

            variation.setProductTemplate(productTemplate);
            variation.setName(varDTO.getName());

            // Atualiza atributos
            variation.setAttributes(updateVariationAttributes(variation, varDTO.getAttributes()));
            // Se quiser atualizar imagens de variação, implemente aqui

            finalVariations.add(variation);
        }

        // Limpa as variações antigas e adiciona as novas
        productTemplate.getVariations().clear();
        productTemplate.getVariations().addAll(finalVariations);
    }

    /**
     * Atualiza atributos da variação. Simplesmente recriamos todos.
     */
    private List<VariationTemplateAttribute> updateVariationAttributes(
            ProductTemplateVariation variation,
            List<VariationTemplateAttributeDTO> attrDTOs
    ) {
        if (attrDTOs == null || attrDTOs.isEmpty()) {
            return new ArrayList<>();
        }
        List<VariationTemplateAttribute> list = new ArrayList<>();
        for (VariationTemplateAttributeDTO dto : attrDTOs) {
            VariationTemplateAttribute attr = new VariationTemplateAttribute();
            attr.setVariationTemplate(variation);
            attr.setAttributeName(dto.getAttributeName());
            attr.setAttributeValue(dto.getAttributeValue());
            list.add(attr);
        }
        return list;
    }

    /**
     * Deleta um arquivo do disco se não for o DEFAULT_IMAGE.
     */
    private void deleteImageIfNotDefault(String url) {
        if (url != null && !url.equals(DEFAULT_IMAGE)) {
            String absolutePath = System.getProperty("user.dir") + url;
            Path path = Paths.get(absolutePath);
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Deleta múltiplas imagens.
     */
    private void deleteImages(List<String> imageUrls) {
        if (imageUrls != null) {
            for (String url : imageUrls) {
                deleteImageIfNotDefault(url);
            }
        }
    }

    /**
     * Converte uma entidade ProductTemplate para DTO.
     */
    private ProductTemplateDTO convertToDTO(ProductTemplate entity) {
        ProductTemplateDTO dto = new ProductTemplateDTO();
        dto.setId(entity.getId());
        dto.setImages(entity.getImages());
        dto.setName(entity.getName());
        dto.setWidth(entity.getWidth());
        dto.setHeight(entity.getHeight());
        dto.setDepth(entity.getDepth());
        dto.setVolumes(entity.getVolumes());
        dto.setNetWeight(entity.getNetWeight());
        dto.setGrossWeight(entity.getGrossWeight());
        dto.setItemsPerBox(entity.getItemsPerBox());
        dto.setShortDescription(entity.getShortDescription());
        dto.setComplementaryDescription(entity.getComplementaryDescription());
        dto.setNotes(entity.getNotes());
        dto.setType(entity.getType());

        if (entity.getBrand() != null) {
            dto.setBrandId(entity.getBrand().getId());
        }
        if (entity.getCategory() != null) {
            dto.setCategoryId(entity.getCategory().getId());
        }
        if (entity.getSubCategory() != null) {
            dto.setSubCategoryId(entity.getSubCategory().getId());
        }

        // TechnicalSpecifications
        if (entity.getTechnicalSpecifications() != null) {
            List<TechnicalSpecificationTemplateDTO> specsDTO = entity.getTechnicalSpecifications().stream()
                    .map(spec -> {
                        TechnicalSpecificationTemplateDTO s = new TechnicalSpecificationTemplateDTO();
                        s.setId(spec.getId());
                        s.setTitle(spec.getTitle());
                        s.setContent(spec.getContent());
                        return s;
                    }).collect(Collectors.toList());
            dto.setTechnicalSpecifications(specsDTO);
        }

        // Variações
        if (entity.getVariations() != null) {
            List<ProductTemplateVariationDTO> varDTOs = entity.getVariations().stream()
                    .map(var -> {
                        ProductTemplateVariationDTO v = new ProductTemplateVariationDTO();
                        v.setId(var.getId());
                        v.setName(var.getName());

                        // Atributos
                        if (var.getAttributes() != null) {
                            List<VariationTemplateAttributeDTO> attrDTOs = var.getAttributes().stream()
                                    .map(attr -> {
                                        VariationTemplateAttributeDTO a = new VariationTemplateAttributeDTO();
                                        a.setId(attr.getId());
                                        a.setAttributeName(attr.getAttributeName());
                                        a.setAttributeValue(attr.getAttributeValue());
                                        return a;
                                    })
                                    .collect(Collectors.toList());
                            v.setAttributes(attrDTOs);
                        }
                        // Imagens (se quiser expor no DTO)
                        if (var.getImages() != null) {
                            List<VariationTemplateImageDTO> imgDTOs = var.getImages().stream()
                                    .map(img -> {
                                        VariationTemplateImageDTO i = new VariationTemplateImageDTO();
                                        i.setId(img.getId());
                                        i.setVariationTemplateId(var.getId());
                                        i.setImageUrl(img.getImageUrl());
                                        i.setOrderIndex(img.getOrderIndex());
                                        return i;
                                    })
                                    .collect(Collectors.toList());
                            v.setImages(imgDTOs);
                        }
                        return v;
                    })
                    .collect(Collectors.toList());
            dto.setVariations(varDTOs);
        }

        return dto;
    }
}
