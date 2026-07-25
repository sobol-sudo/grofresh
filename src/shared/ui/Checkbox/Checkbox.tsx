import { Checkbox as CheckboxMui, SxProps, Theme } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';

interface CheckboxProps {
  sx?: SxProps<Theme>;
  checked: boolean;
  onClick?: () => void;
  /**
   * Report a state the user cannot change from here.
   *
   * Without this a read-only row still renders a real checkbox: focusable, clickable
   * and completely inert. Disabling it is the honest version — the state is still
   * announced, but nothing offers an interaction that goes nowhere.
   */
  disabled?: boolean;
}

export default function Checkbox({ sx, checked, onClick, disabled = false }: CheckboxProps) {
  const defaultSx: SxProps<Theme> = {
    padding: 0,
    ...sx,
  };

  return (
    <CheckboxMui
      sx={defaultSx}
      disableRipple
      checked={checked}
      disabled={disabled}
      icon={
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "2px solid #D9D9D9",
            display: "inline-block",
          }}
        />
      }
      checkedIcon={
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "black",
            display: "inline-block",
            position: "relative",
          }}
        >
          <CheckIcon sx={{
            fontSize: 18,
            position: 'absolute',
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fill: "white",
          }} />
        </span>
      }
      onClick={onClick}
    />
  );
}
