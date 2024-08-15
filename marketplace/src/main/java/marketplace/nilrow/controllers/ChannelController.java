package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.channel.ChannelDTO;
import marketplace.nilrow.domain.channel.about.About;
import marketplace.nilrow.domain.channel.about.FAQDTO;
import marketplace.nilrow.domain.channel.about.AboutDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.repositories.ChannelRepository;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.services.ChannelService;
import marketplace.nilrow.services.AboutService;
import marketplace.nilrow.services.FAQService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
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

    @Autowired
    private AboutService aboutService;

    @Autowired
    private FAQService faqService;

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";
    private static final String DEFAULT_IMAGE = "/uploads/25990a43-5546-4b25-aa4d-67da7de149af_defaultImage.png";

    @GetMapping("/nickname/{nickname}/about")
    public ResponseEntity<AboutDTO> getAboutByNickname(@PathVariable String nickname) {
        Optional<Channel> channelOpt = channelService.getChannelByNickname(nickname);
        if (channelOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Channel channel = channelOpt.get();
        Optional<About> aboutOpt = aboutService.getAboutByChannel(channel);
        if (aboutOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        About about = aboutOpt.get();
        AboutDTO aboutDTO = new AboutDTO(
                about.getId(),
                about.getChannel().getId(),
                about.getAboutText(),
                about.getStorePolicies(),
                about.getExchangesAndReturns(),
                about.getAdditionalInfo()
        );

        return ResponseEntity.ok(aboutDTO);
    }

    @GetMapping("/nickname/{nickname}/faqs")
    public ResponseEntity<List<FAQDTO>> getFAQsByNickname(@PathVariable String nickname) {
        Optional<Channel> channelOpt = channelService.getChannelByNickname(nickname);
        if (channelOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Channel channel = channelOpt.get();
        Optional<About> aboutOpt = aboutService.getAboutByChannelId(channel.getId());
        if (aboutOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        About about = aboutOpt.get();
        List<FAQDTO> faqDTOs = about.getFaqs().stream()
                .map(faq -> new FAQDTO(faq.getId(), faq.getQuestion(), faq.getAnswer(), about.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(faqDTOs);
    }

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

        if (channelDTO.getName() != null) {
            channel.setName(channelDTO.getName());
        }
        if (channelDTO.getBiography() != null) {
            channel.setBiography(channelDTO.getBiography());
        }
        if (channelDTO.getExternalLink() != null) {
            channel.setExternalLink(channelDTO.getExternalLink());
        }
        // We won't update imageUrl here to keep the current implementation

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
        if (people == null || people.getChannel() == null || !people.getChannel().isActive()) {
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
            channel.setImageUrl(DEFAULT_IMAGE);
        } else {
            if (!Files.exists(Paths.get(UPLOAD_DIR))) {
                Files.createDirectories(Paths.get(UPLOAD_DIR));
            }

            String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String filepath = Paths.get(UPLOAD_DIR, filename).toString();

            image.transferTo(new File(filepath));

            channel.setImageUrl("/uploads/" + filename);
        }

        channelRepository.save(channel);

        return ResponseEntity.ok(channel.getImageUrl());
    }

    @PutMapping("/{id}/toggle-visibility")
    public ResponseEntity<Void> toggleVisibility(@PathVariable String id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        Channel channel = channelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        if (!channel.getPeople().equals(people)) {
            return ResponseEntity.status(403).build();
        }

        boolean newActiveStatus = !channel.isActive();
        channel.setActive(newActiveStatus);
        channelRepository.save(channel);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/is-active")
    public ResponseEntity<Boolean> isChannelActive(@PathVariable String id) {
        Channel channel = channelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        return ResponseEntity.ok(channel.isActive());
    }

    @GetMapping("/person/{personId}/channel")
    public ResponseEntity<ChannelDTO> getChannelByPersonId(@PathVariable String personId) {
        People people = peopleRepository.findById(personId)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa não encontrada"));

        Channel channel = people.getChannel();
        if (channel == null) {
            return ResponseEntity.notFound().build();
        }

        ChannelDTO channelDTO = new ChannelDTO(channel);
        return ResponseEntity.ok(channelDTO);
    }

}
