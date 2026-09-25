package com.mongilbasket.parent;

import java.util.List;

import com.mongilbasket.player.PlayerResponse;

public record ParentDetailResponse(ParentResponse parent, List<PlayerResponse> children) {}
