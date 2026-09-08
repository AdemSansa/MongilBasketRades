package com.mongilbasket.user;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.auth.UserResponse;
import com.mongilbasket.coach.Coach;
import com.mongilbasket.coach.CoachRepository;
import com.mongilbasket.common.ConflictException;
import com.mongilbasket.parent.Parent;
import com.mongilbasket.parent.ParentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CoachRepository coachRepository;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> list(Role role) {
        List<User> users = role != null ? userRepository.findByRole(role) : userRepository.findAll();
        return users.stream().map(UserResponse::from).toList();
    }

    /**
     * Creates a COACH, ADMIN, or PARENT account, auto-creating the linked Coach/Parent
     * profile. Parents are normally created by an admin this way (the academy handles
     * registration directly) rather than self-registering, though /auth/register still
     * exists as an alternate path.
     */
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .build();
        userRepository.save(user);

        if (request.role() == Role.COACH) {
            Coach coach = Coach.builder().user(user).build();
            coachRepository.save(coach);
        } else if (request.role() == Role.PARENT) {
            Parent parent = Parent.builder().user(user).build();
            parentRepository.save(parent);
        }

        return UserResponse.from(user);
    }
}
