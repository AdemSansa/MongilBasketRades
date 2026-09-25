package com.mongilbasket.parent;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.ConflictException;
import com.mongilbasket.common.EmailService;
import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.common.PasswordGenerator;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.player.PlayerResponse;
import com.mongilbasket.user.Role;
import com.mongilbasket.user.User;
import com.mongilbasket.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParentService {

    private final ParentRepository parentRepository;
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<PlayerResponse> myChildren(User currentUser) {
        Parent parent = findByUserOrThrow(currentUser);
        return playerRepository.findByParentId(parent.getId()).stream().map(PlayerResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ParentResponse> list() {
        return parentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ParentResponse get(UUID id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Parent not found"));
        return toResponse(parent);
    }

    /** Creates the parent's User + Parent profile with a generated password and emails it, same as coach registration. */
    @Transactional
    public ParentResponse create(ParentCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with this email already exists");
        }

        String temporaryPassword = PasswordGenerator.generate();
        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(temporaryPassword))
                .role(Role.PARENT)
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .build();
        userRepository.save(user);

        Parent parent = parentRepository.save(Parent.builder().user(user).address(request.address()).build());

        emailService.send(
                user.getEmail(),
                "Your Mongil Basket Rades parent account",
                """
                Hi %s,

                A parent account was created for you at Mongil Basket Rades so you can follow your child's
                attendance and payments in the mobile app.

                Email: %s
                Temporary password: %s

                Please change your password after your first login.

                -- Mongil Basket Rades
                """
                        .formatted(request.firstName(), user.getEmail(), temporaryPassword));

        return ParentResponse.from(parent, 0);
    }

    @Transactional
    public ParentResponse updateMe(ParentUpdateRequest request, User currentUser) {
        Parent parent = findByUserOrThrow(currentUser);

        if (request.address() != null) {
            parent.setAddress(request.address());
        }
        if (request.phone() != null) {
            currentUser.setPhone(request.phone());
            userRepository.save(currentUser);
        }

        return toResponse(parent);
    }

    private ParentResponse toResponse(Parent parent) {
        return ParentResponse.from(parent, playerRepository.findByParentId(parent.getId()).size());
    }

    private Parent findByUserOrThrow(User currentUser) {
        return parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));
    }
}
