import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Segment,
  Item,
  Divider,
  Button,
  Icon,
  Message,
  Menu,
  Header,
} from 'semantic-ui-react';
import he from 'he';

import Countdown from '../Countdown';
import { getLetter } from '../../utils';

const Quiz = ({ data, countdownTime, powerups, endQuiz }) => {
  const { enableFiftyFifty = false, enableSkip = false } = powerups || {};

  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userSlectedAns, setUserSlectedAns] = useState(null);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);
  const [timeTaken, setTimeTaken] = useState(null);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [skipUsed, setSkipUsed] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [skippedQuestions, setSkippedQuestions] = useState(0);

  useEffect(() => {
    if (questionIndex > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [questionIndex]);

  const handleItemClick = (e, { name }) => {
    if (eliminatedOptions.includes(name)) return;
    setUserSlectedAns(name);
  };

  const advanceOrFinish = (qna, nextCorrect, nextSkipped) => {
    if (questionIndex === data.length - 1) {
      return endQuiz({
        totalQuestions: data.length,
        correctAnswers: nextCorrect,
        skippedQuestions: nextSkipped,
        timeTaken,
        questionsAndAnswers: qna,
      });
    }

    setCorrectAnswers(nextCorrect);
    setSkippedQuestions(nextSkipped);
    setQuestionIndex(questionIndex + 1);
    setUserSlectedAns(null);
    setQuestionsAndAnswers(qna);
    setEliminatedOptions([]);
  };

  const handleNext = () => {
    let point = 0;
    if (userSlectedAns === he.decode(data[questionIndex].correct_answer)) {
      point = 1;
    }

    const qna = questionsAndAnswers;
    qna.push({
      question: he.decode(data[questionIndex].question),
      user_answer: userSlectedAns,
      correct_answer: he.decode(data[questionIndex].correct_answer),
      point,
    });

    advanceOrFinish(qna, correctAnswers + point, skippedQuestions);
  };

  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed) return;

    const correct = he.decode(data[questionIndex].correct_answer);
    const incorrect = data[questionIndex].options
      .map(o => he.decode(o))
      .filter(o => o !== correct);

    const shuffled = [...incorrect].sort(() => Math.random() - 0.5);
    const toEliminate = shuffled.slice(0, Math.max(0, incorrect.length - 1));

    if (userSlectedAns && toEliminate.includes(userSlectedAns)) {
      setUserSlectedAns(null);
    }

    setEliminatedOptions(toEliminate);
    setFiftyFiftyUsed(true);
  };

  const handleSkip = () => {
    if (skipUsed) return;

    const qna = questionsAndAnswers;
    qna.push({
      question: he.decode(data[questionIndex].question),
      user_answer: 'Skipped',
      correct_answer: he.decode(data[questionIndex].correct_answer),
      point: 0,
      skipped: true,
    });

    setSkipUsed(true);
    advanceOrFinish(qna, correctAnswers, skippedQuestions + 1);
  };

  const timeOver = timeTaken => {
    return endQuiz({
      totalQuestions: data.length,
      correctAnswers,
      skippedQuestions,
      timeTaken,
      questionsAndAnswers,
    });
  };

  return (
    <Item.Header>
      <Container>
        <Segment>
          <Item.Group divided>
            <Item>
              <Item.Content>
                <Item.Extra>
                  <Header as="h1" block floated="left">
                    <Icon name="info circle" />
                    <Header.Content>
                      {`Question No.${questionIndex + 1} of ${data.length}`}
                    </Header.Content>
                  </Header>
                  <Countdown
                    countdownTime={countdownTime}
                    timeOver={timeOver}
                    setTimeTaken={setTimeTaken}
                  />
                </Item.Extra>
                <br />
                <Item.Meta>
                  <Message size="huge" floating>
                    <b>{`Q. ${he.decode(data[questionIndex].question)}`}</b>
                  </Message>
                  <br />
                  <Item.Description>
                    <h3>Please choose one of the following answers:</h3>
                  </Item.Description>
                  <Divider />
                  <Menu vertical fluid size="massive">
                    {data[questionIndex].options.map((option, i) => {
                      const letter = getLetter(i);
                      const decodedOption = he.decode(option);
                      const isEliminated = eliminatedOptions.includes(
                        decodedOption
                      );

                      return (
                        <Menu.Item
                          key={decodedOption}
                          name={decodedOption}
                          active={userSlectedAns === decodedOption}
                          onClick={handleItemClick}
                          disabled={isEliminated}
                          style={
                            isEliminated
                              ? {
                                  textDecoration: 'line-through',
                                  opacity: 0.5,
                                }
                              : undefined
                          }
                        >
                          <b style={{ marginRight: '8px' }}>{letter}</b>
                          {decodedOption}
                        </Menu.Item>
                      );
                    })}
                  </Menu>
                  {(enableFiftyFifty || enableSkip) && (
                    <div style={{ marginTop: 12 }}>
                      {enableFiftyFifty && (
                        <Button
                          color="orange"
                          icon="filter"
                          content="50/50"
                          onClick={handleFiftyFifty}
                          disabled={fiftyFiftyUsed}
                          style={{ marginRight: 8, marginBottom: 8 }}
                        />
                      )}
                      {enableSkip && (
                        <Button
                          color="grey"
                          icon="forward"
                          content="Skip"
                          onClick={handleSkip}
                          disabled={skipUsed}
                          style={{ marginBottom: 8 }}
                        />
                      )}
                    </div>
                  )}
                </Item.Meta>
                <Divider />
                <Item.Extra>
                  <Button
                    primary
                    content="Next"
                    onClick={handleNext}
                    floated="right"
                    size="big"
                    icon="right chevron"
                    labelPosition="right"
                    disabled={!userSlectedAns}
                  />
                </Item.Extra>
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
        <br />
      </Container>
    </Item.Header>
  );
};

Quiz.propTypes = {
  data: PropTypes.array.isRequired,
  countdownTime: PropTypes.number.isRequired,
  powerups: PropTypes.shape({
    enableFiftyFifty: PropTypes.bool,
    enableSkip: PropTypes.bool,
  }),
  endQuiz: PropTypes.func.isRequired,
};

Quiz.defaultProps = {
  powerups: { enableFiftyFifty: false, enableSkip: false },
};

export default Quiz;
