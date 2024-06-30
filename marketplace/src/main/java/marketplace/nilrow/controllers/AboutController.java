package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.channel.*;
import marketplace.nilrow.domain.channel.about.About;
import marketplace.nilrow.domain.channel.about.Category;
import marketplace.nilrow.domain.channel.about.FAQ;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.services.AboutService;
import marketplace.nilrow.services.ChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/about")
public class AboutController {

    @Autowired
    private AboutService aboutService;

    @Autowired
    private ChannelService channelService;

    @PostMapping
    public ResponseEntity<About> createAbout(@RequestBody About about) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Channel> channelOpt = channelService.getChannelByPeople(user.getPeople());
        if (channelOpt.isPresent()) {
            Channel channel = channelOpt.get();
            about.setChannel(channel);
            About savedAbout = aboutService.createAbout(about);
            return ResponseEntity.ok(savedAbout);
        }
        return ResponseEntity.status(403).build();
    }

    @GetMapping
    public ResponseEntity<About> getAboutByChannel() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Channel> channelOpt = channelService.getChannelByPeople(user.getPeople());
        if (channelOpt.isPresent()) {
            Channel channel = channelOpt.get();
            return aboutService.getAboutByChannel(channel)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.status(403).build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = aboutService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        Category savedCategory = aboutService.createCategory(category);
        return ResponseEntity.ok(savedCategory);
    }

    @PostMapping("/faq")
    public ResponseEntity<FAQ> addFAQ(@RequestBody FAQ faq) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Channel> channelOpt = channelService.getChannelByPeople(user.getPeople());
        if (channelOpt.isPresent()) {
            Channel channel = channelOpt.get();
            Optional<About> aboutOpt = aboutService.getAboutByChannel(channel);
            if (aboutOpt.isPresent()) {
                About about = aboutOpt.get();
                faq.setAbout(about);
                FAQ savedFAQ = aboutService.addFAQ(faq);
                return ResponseEntity.ok(savedFAQ);
            }
        }
        return ResponseEntity.status(403).build();
    }

    @DeleteMapping("/faq/{faqId}")
    public ResponseEntity<Void> deleteFAQ(@PathVariable Long faqId) {
        aboutService.deleteFAQ(faqId);
        return ResponseEntity.noContent().build();
    }
}