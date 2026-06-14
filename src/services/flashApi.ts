export interface FlashPosition {
  key: string;
  sideUi: string;
  marketSymbol: string;
  collateralSymbol: string;
  entryPriceUi: string;
  sizeAmountUi: string;
  sizeUsdUi: string;
  collateralAmountUi: string;
  collateralUsdUi: string;
  pnlWithFeeUsdUi: string;
  pnlPercentageWithFee: string;
  liquidationPriceUi: string;
  leverageUi: string;
  pnl: {
    profitUsd: string;
    lossUsd: string;
    exitFeeUsd: string;
    borrowFeeUsd: string;
  };
}

export async function fetchUserPositions(walletPubkey: string): Promise<FlashPosition[]> {
  try {
    const response = await fetch(`https://flashapi.trade/positions/owner/${walletPubkey}?includePnlInLeverageDisplay=true`);
    if (!response.ok) {
      throw new Error(`Failed to fetch positions: ${response.statusText}`);
    }
    const data: FlashPosition[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Flash Trade positions:", error);
    return [];
  }
}
