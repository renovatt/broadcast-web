import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { formatPhone } from '@/shared/utils/phone';
import type { Contact } from '../types/contact';

type ContactsTableProps = {
  contacts: readonly Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
};

export const ContactsTable = ({ contacts, onEdit, onDelete }: ContactsTableProps) => (
  <TableContainer component={Paper} variant="outlined">
    <Table
      size="small"
      aria-label="Contatos"
      className="[&_th]:px-2! [&_td]:px-2! sm:[&_th]:px-4! sm:[&_td]:px-4!"
    >
      <TableHead>
        <TableRow>
          <TableCell>Nome</TableCell>
          <TableCell>Telefone</TableCell>
          <TableCell align="right">
            {/* No mobile o rótulo fica só para leitores de tela; os botões têm aria-label. */}
            <span className="sr-only sm:not-sr-only">Ações</span>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow key={contact.id} hover>
            <TableCell className="max-w-40 truncate sm:max-w-none" title={contact.name}>
              {contact.name}
            </TableCell>
            <TableCell className="whitespace-nowrap tabular-nums">
              {formatPhone(contact.phone)}
            </TableCell>
            <TableCell align="right" className="whitespace-nowrap">
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  aria-label={`Editar ${contact.name}`}
                  onClick={() => onEdit(contact)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir">
                <IconButton
                  size="small"
                  aria-label={`Excluir ${contact.name}`}
                  onClick={() => onDelete(contact)}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
