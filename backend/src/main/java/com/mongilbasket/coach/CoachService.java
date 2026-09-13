package com.mongilbasket.coach;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.ConflictException;
import com.mongilbasket.common.EmailService;
import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.common.PasswordGenerator;
import com.mongilbasket.group.Group;
import com.mongilbasket.group.GroupRepository;
import com.mongilbasket.user.Role;
import com.mongilbasket.user.User;
import com.mongilbasket.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CoachService {

    private final CoachRepository coachRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<CoachResponse> list() {
        return coachRepository.findAll().stream()
                .map(coach -> CoachResponse.from(coach, groupRepository.findByCoachId(coach.getId()).size()))
                .toList();
    }

    @Transactional(readOnly = true)
    public CoachDetailResponse get(UUID id) {
        Coach coach = coachRepository.findById(id).orElseThrow(() -> new NotFoundException("Coach not found"));
        return CoachDetailResponse.from(coach, groupRepository.findByCoachId(coach.getId()));
    }

    /**
     * Creates the User (role COACH) + Coach profile with a freshly generated password,
     * then emails the coach their login credentials. The email send itself never blocks
     * account creation -- see EmailService.
     */
    @Transactional
    public CoachDetailResponse create(CoachCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with this email already exists");
        }

        String temporaryPassword = PasswordGenerator.generate();

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(temporaryPassword))
                .role(Role.COACH)
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .build();
        userRepository.save(user);

        Coach coach = Coach.builder().user(user).bio(request.bio()).build();
        coachRepository.save(coach);

        emailService.send(
                user.getEmail(),
                "Your Mongil Basket Rades coach account",
                """
                Hi %s,

                An account was created for you on Mongil Basket Rades.

                Email: %s
                Temporary password: %s

                Sign in on the mobile app or the admin site and change your password after your first login.

                -- Mongil Basket Rades
                """
                        .formatted(request.firstName(), user.getEmail(), temporaryPassword));

        return CoachDetailResponse.from(coach, List.of());
    }

    @Transactional
    public CoachDetailResponse update(UUID id, CoachUpdateRequest request) {
        Coach coach = coachRepository.findById(id).orElseThrow(() -> new NotFoundException("Coach not found"));
        User user = coach.getUser();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        coach.setBio(request.bio());
        return CoachDetailResponse.from(coach, groupRepository.findByCoachId(coach.getId()));
    }

    @Transactional
    public CoachDetailResponse updateStatus(UUID id, CoachStatusUpdateRequest request) {
        Coach coach = coachRepository.findById(id).orElseThrow(() -> new NotFoundException("Coach not found"));
        coach.getUser().setStatus(request.status());
        return CoachDetailResponse.from(coach, groupRepository.findByCoachId(coach.getId()));
    }
}
