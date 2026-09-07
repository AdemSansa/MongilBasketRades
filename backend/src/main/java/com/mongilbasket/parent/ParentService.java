package com.mongilbasket.parent;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.player.PlayerResponse;
import com.mongilbasket.user.User;
import com.mongilbasket.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParentService {

    private final ParentRepository parentRepository;
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PlayerResponse> myChildren(User currentUser) {
        Parent parent = findByUserOrThrow(currentUser);
        return playerRepository.findByParentId(parent.getId()).stream().map(PlayerResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ParentResponse get(UUID id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Parent not found"));
        return ParentResponse.from(parent);
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

        return ParentResponse.from(parent);
    }

    private Parent findByUserOrThrow(User currentUser) {
        return parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));
    }
}
