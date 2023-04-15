#!/bin/bash

# nasty hack to avoid having to use different module resolution (incompatible with firebase)
sed -i -e 's|resolution-mode="require"||' node_modules/ethers/types/providers/provider-ipcsocket.d.ts
