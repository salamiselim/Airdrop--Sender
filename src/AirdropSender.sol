// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


contract AirdropSender {
    
    function airdropERC20(
        address tokenAddress,
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 totalAmount
    ) external {
        assembly {
            // check for equal lengths
            if iszero(eq(recipients.length, amounts.length)) {
                mstore(0x00, 0x50a302d6) // cast sig TSender__LengthsDontMatch()
                revert(0x1c, 0x04)
            }

            // transferFrom(address from, address to, uint256 amount)
            // cast sig "transferFrom(address,address,uint256)"
            // This will result in memory looking like this:
            // 0x00: 0x23b872dd00000000000000000000000000000000000000000000000000000000
            mstore(0x00, hex"23b872dd")
            // from address
            mstore(0x04, caller())
            // to address (this contract)
            mstore(0x24, address())
            // total amount
            mstore(0x44, totalAmount)

            if iszero(call(gas(), tokenAddress, 0, 0x00, 0x64, 0, 0)) {
                mstore(0x00, 0xfa10ea06) // cast sig "TSender__TransferFailed()"
                revert(0x1c, 0x04)
            }

            // transfer(address to, uint256 value)
            mstore(0x00, hex"a9059cbb")
            
            // recipients.offset actually points to the recipients.length offset, not the first address of the array offset
            let end := add(recipients.offset, shl(5, recipients.length))
            let diff := sub(recipients.offset, amounts.offset)

            // Checking totals at the end
            let addedAmount := 0
            for { let addressOffset := recipients.offset } 1 {} {
                let recipient := calldataload(addressOffset)

                // Check to address
                if iszero(recipient) {
                    mstore(0x00, 0x1647bca2) // cast sig "TSender__ZeroAddress()"
                    revert(0x1c, 0x04)
                }

                // to address
                mstore(0x04, recipient)
                // amount
                mstore(0x24, calldataload(sub(addressOffset, diff)))
                // Keep track of the total amount
                addedAmount := add(addedAmount, mload(0x24))

                // transfer the tokens
                if iszero(call(gas(), tokenAddress, 0, 0x00, 0x44, 0, 0)) {
                    mstore(0x00, 0xfa10ea06) // cast sig "TSender__TransferFailed()"
                    revert(0x1c, 0x04)
                }

                // increment the address offset
                addressOffset := add(addressOffset, 0x20)
                // if addressOffset >= end, break
                if iszero(lt(addressOffset, end)) { break }
            }

            // Check if the totals match
            if iszero(eq(addedAmount, totalAmount)) {
                mstore(0x00, 0x63b62563) // cast sig TSender__TotalDoesntAddUp()
                revert(0x1c, 0x04)
            }
        }
    }

    function areListsValid(address[] calldata recipients, uint256[] calldata amounts) external pure returns (bool) {
        if (recipients.length == 0) {
            return false;
        }
        if (recipients.length != amounts.length) {
            return false;
        }
        for (uint256 i; i < recipients.length; i++) {
            if (recipients[i] == address(0)) {
                return false;
            }
            if (amounts[i] == 0) {
                return false;
            }
            for (uint256 j = i + 1; j < recipients.length; j++) {
                if (recipients[i] == recipients[j]) {
                    return false;
                }
            }
        }
        return true;
    }
}