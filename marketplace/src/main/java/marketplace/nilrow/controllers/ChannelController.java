package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.channel.ChannelDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.repositories.ChannelRepository;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.services.ChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/channels")
@Tag(name = "Channel", description = "Operações relacionadas aos canais dos usuários")
public class ChannelController {

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private PeopleRepository peopleRepository;

    @Autowired
    private ChannelService channelService;

    // Define o diretório de upload com um caminho absoluto
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";
    private static final String DEFAULT_IMAGE = "/uploads/25990a43-5546-4b25-aa4d-67da7de149af_defaultImage.png";

    @GetMapping
    public ResponseEntity<List<ChannelDTO>> getChannels() {
        List<Channel> channels = channelRepository.findAll();
        List<ChannelDTO> channelDTOs = channels.stream().map(ChannelDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(channelDTOs);
    }

    @PostMapping
    public ResponseEntity<Void> addChannel(@RequestBody ChannelDTO channelDTO) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        Channel channel = new Channel(
                channelDTO.getName(),
                channelDTO.getBiography(),
                channelDTO.getExternalLink(),
                channelDTO.getImageUrl(),
                people
        );

        channelRepository.save(channel);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateChannel(@PathVariable String id, @RequestBody ChannelDTO channelDTO) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        Channel channel = channelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        if (!channel.getPeople().equals(people)) {
            return ResponseEntity.status(403).build();
        }

        channel.setName(channelDTO.getName());
        channel.setBiography(channelDTO.getBiography());
        channel.setExternalLink(channelDTO.getExternalLink());
        channel.setImageUrl(channelDTO.getImageUrl());

        channelRepository.save(channel);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/upload-image")
    public ResponseEntity<String> updateImage(@PathVariable String id, @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        Channel channel = channelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        if (!channel.getPeople().equals(people)) {
            return ResponseEntity.status(403).build();
        }

        String oldImageUrl = channel.getImageUrl();

        if (image == null || image.isEmpty()) {
            channel.setImageUrl(DEFAULT_IMAGE);
        } else {
            if (!Files.exists(Paths.get(UPLOAD_DIR))) {
                Files.createDirectories(Paths.get(UPLOAD_DIR));
            }

            String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String filepath = Paths.get(UPLOAD_DIR, filename).toString();

            image.transferTo(new File(filepath));

            channel.setImageUrl("/uploads/" + filename);

            // Excluir a imagem antiga se não for a imagem padrão
            if (oldImageUrl != null && !oldImageUrl.equals(DEFAULT_IMAGE)) {
                File oldImageFile = new File(System.getProperty("user.dir") + oldImageUrl);
                if (oldImageFile.exists()) {
                    oldImageFile.delete();
                }
            }
        }

        channelRepository.save(channel);

        return ResponseEntity.ok(channel.getImageUrl());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body("File too large!");
    }

    @DeleteMapping("/delete-my-channel")
    public ResponseEntity<Void> deleteMyChannel() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        if (people == null) {
            return ResponseEntity.status(404).build();
        }

        Channel channel = channelRepository.findByPeople(people).orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        try {
            System.out.println("Tentando deletar o canal: " + channel.getId());
            channelRepository.delete(channel);
            System.out.println("Canal deletado com sucesso: " + channel.getId());

            // Verificar se o canal ainda existe
            if (channelRepository.existsById(channel.getId())) {
                System.out.println("Erro ao deletar o canal: " + channel.getId());
                return ResponseEntity.status(500).build();
            } else {
                System.out.println("Canal deletado verificado: " + channel.getId());
            }

        } catch (Exception e) {
            System.out.println("Erro ao deletar o canal: " + channel.getId());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }

        return ResponseEntity.ok().build();
    }



    @GetMapping("/my")
    public ResponseEntity<ChannelDTO> getMyChannel() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        Channel channel = people.getChannel();
        if (channel == null) {
            return ResponseEntity.notFound().build();
        }
        ChannelDTO channelDTO = new ChannelDTO(channel);
        return ResponseEntity.ok(channelDTO);
    }

    @GetMapping("/nickname/{nickname}")
    public ResponseEntity<ChannelDTO> getChannelByNickname(@PathVariable String nickname) {
        People people = peopleRepository.findByUserNickname(nickname);
        if (people == null || people.getChannel() == null) {
            return ResponseEntity.notFound().build();
        }
        ChannelDTO channelDTO = new ChannelDTO(people.getChannel());
        return ResponseEntity.ok(channelDTO);
    }

    @GetMapping("/is-owner/{id}")
    public ResponseEntity<Boolean> isChannelOwner(@PathVariable String id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        Channel channel = channelRepository.findById(id).orElse(null);
        if (channel == null || !channel.getPeople().getUser().equals(user)) {
            return ResponseEntity.ok(false);
        }
        return ResponseEntity.ok(true);
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<String> uploadImage(@PathVariable String id, @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        Channel channel = channelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        if (image == null || image.isEmpty()) {
            // Definir a imagem padrão
            channel.setImageUrl(DEFAULT_IMAGE);
        } else {
            // Ensure the uploads directory exists
            if (!Files.exists(Paths.get(UPLOAD_DIR))) {
                Files.createDirectories(Paths.get(UPLOAD_DIR));
            }

            // Generate a unique filename
            String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String filepath = Paths.get(UPLOAD_DIR, filename).toString();

            // Save the file locally
            image.transferTo(new File(filepath));

            // Update the channel's imageUrl
            channel.setImageUrl("/uploads/" + filename);
        }

        channelRepository.save(channel);

        return ResponseEntity.ok(channel.getImageUrl());
    }

}
