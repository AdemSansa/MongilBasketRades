package com.mongilbasket.user;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.auth.UserResponse;
import com.mongilbasket.coach.Coach;
import com.mongilbasket.coach.CoachRepository;
import com.mongilbasket.common.BadRequestException;
import com.mongilbasket.common.ConflictException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CoachRepository coachRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> list(Role role) {
        List<User> users = role != null ? userRepository.findByRole(role) : userRepository.findAll();
        return users.stream().map(UserResponse::from).toList();
    }

    /** Creates a COACH or ADMIN account, auto-creating the Coach profile when role == COACH. */
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (request.role() == Role.PARENT) {
            throw new BadRequestException("Parents self-register via /auth/register");
        }
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
        }

        return UserResponse.from(user);
    }
}
