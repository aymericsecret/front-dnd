"use client";
import { styled } from "styled-components";
import { Kanban } from "./Kanban";

const Main = styled.main`
  overflow-x: hidden;
  height: 100vh;
  padding: 10px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const MainWrapper = styled.main`
display: flex;
flex-direction: column;
flex: 1 1 0%;
overflow: hidden;
}
`;

const Title = styled.div`
  height: 100px;
  background-color: white;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Home() {
  return (
    <Main>
      <MainWrapper>
        <Title> Title </Title>
        <Kanban />
      </MainWrapper>
    </Main>
  );
}
